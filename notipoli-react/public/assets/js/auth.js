/* =========================================
   auth.js - Autenticación y control de roles
   Roles: Admin | Registrado | Usuario (anón.)

   Compatibilidad file:// (Firefox/Chrome):
   La sesión viaja en el parámetro ?_s=BASE64
   de la URL y se intercepta en cada página.
   ========================================= */

const AUTH_SESSION_KEY    = 'notipoli_sesion';
const USUARIOS_CUSTOM_KEY = 'notipoli_usuarios_custom';
const SESS_PARAM          = '_s';

/* Usuarios base embebidos (respaldo si fetch falla con file://) */
const USUARIOS_BASE = [
  {
    id: 'admin_001', nombre: 'Jorge Caicedo',
    email: 'jorge.caicedo@admin.com', password: 'Admin@2026',
    rol: 'Admin', creado: '2026-09-29'
  },
  {
    id: 'reg_001', nombre: 'Jorge Caicedo',
    email: 'jorge.caicedo@registrado.com', password: 'Registrado@2026',
    rol: 'Registrado', creado: '2026-09-29'
  }
];

/* ---- Carga de usuarios ---- */

async function cargarUsuariosJSON() {
  try {
    const resp = await fetch('assets/data/usuarios.json');
    if (!resp.ok) throw new Error();
    return await resp.json();
  } catch (_) {
    return USUARIOS_BASE;
  }
}

async function getAllUsuarios() {
  const base   = await cargarUsuariosJSON();
  const custom = JSON.parse(localStorage.getItem(USUARIOS_CUSTOM_KEY) || '[]');
  return [...base, ...custom.filter(c => !base.some(b => b.email === c.email))];
}

/* ---- Codificación de sesión (maneja caracteres acentuados) ---- */

function encodeSession(data) {
  try { return btoa(encodeURIComponent(JSON.stringify(data))); } catch (_) { return null; }
}

function decodeSession(encoded) {
  try { return JSON.parse(decodeURIComponent(atob(encoded))); } catch (_) { return null; }
}

/* ---- Sesión: usa localStorage PROPIO de cada página + URL param ---- */

function getUsuarioActual() {
  /* Leer de localStorage de la página actual */
  try {
    const data = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null');
    if (data && data.rol) return data;
    if (data) localStorage.removeItem(AUTH_SESSION_KEY); /* formato antiguo */
  } catch (_) {}
  return null;
}

function getRol()        { const u = getUsuarioActual(); return u ? u.rol : 'Usuario'; }
function isAdmin()       { return getRol() === 'Admin'; }
function isRegistrado()  { return getRol() === 'Registrado' || getRol() === 'Admin'; }
function isLoggedIn()    { return getUsuarioActual() !== null; }

function setSession(usuario) {
  const payload = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  try { localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload)); } catch (_) {}
}

function logout() {
  try { localStorage.removeItem(AUTH_SESSION_KEY); } catch (_) {}
  /*
    Redirigir a login.html?_logout=1 para que login.html también limpie
    su propio localStorage (cada archivo tiene el suyo en Firefox file://).
  */
  location.href = 'login.html?_logout=1';
}

/* ---- Importación de sesión desde URL ---- */

/*
  Al cargar cualquier página, si la URL tiene ?_s=BASE64, se decodifica
  y se guarda en el localStorage DE ESA PÁGINA. Luego se limpia la URL.
  Esto permite que la sesión cruce entre archivos con file://.
*/
function importarSesionDesdeURL() {
  const params = new URLSearchParams(location.search);

  /* Señal de logout: limpiar localStorage de ESTA página y salir */
  if (params.get('_logout') === '1') {
    try { localStorage.removeItem(AUTH_SESSION_KEY); } catch (_) {}
    params.delete('_logout');
    const ns = params.toString() ? '?' + params.toString() : '';
    history.replaceState(null, '', location.pathname + ns + location.hash);
    return;
  }

  /* Importar sesión desde ?_s= */
  const encoded = params.get(SESS_PARAM);
  if (!encoded) return;

  const data = decodeSession(encoded);
  if (data && data.rol) {
    try { localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(data)); } catch (_) {}
  }

  params.delete(SESS_PARAM);
  const newSearch = params.toString() ? '?' + params.toString() : '';
  history.replaceState(null, '', location.pathname + newSearch + location.hash);
}

/* ---- URL con sesión para navegación interna ---- */

function urlConSesion(href) {
  const sess = encodeSession(getUsuarioActual());
  if (!sess) return href;
  const sep = href.includes('?') ? '&' : '?';
  return href + sep + SESS_PARAM + '=' + sess;
}

/*
  Interceptor de clicks: antes de seguir un link interno agrega:
  - ?_s=BASE64  → sesión
  - &_favs=1,3  → lista de favoritos actuales (si existen)
  Esto permite que la página destino reciba el estado completo.
*/
document.addEventListener('click', function(e) {
  const a = e.target.closest('a[href]');
  if (!a || a.target === '_blank') return;

  const href = a.getAttribute('href') || '';
  if (!href || href.startsWith('http') || href.startsWith('//') ||
      href.startsWith('#') || href.startsWith('mailto:') ||
      href.startsWith('javascript:') || href.includes(SESS_PARAM + '=')) return;

  if (!isLoggedIn()) return;

  let augmented = urlConSesion(href);

  /* Pasar favoritos si la función está disponible (favoritos.js cargado) */
  try {
    if (typeof getFavoritos === 'function') {
      const favs = getFavoritos();
      if (favs.length > 0) augmented += '&_favs=' + favs.join(',');
    }
  } catch (_) {}

  /* Pasar noticias personalizadas (crud.js puede no estar cargado, leer directo) */
  try {
    const rawNews = localStorage.getItem('notipoli_noticias_custom');
    if (rawNews && rawNews !== '[]') {
      augmented += '&_cnews=' + btoa(encodeURIComponent(rawNews));
    }
  } catch (_) {}

  a.setAttribute('href', augmented);
});

/* ---- Operaciones de auth ---- */

async function loginUsuario(email, password) {
  const usuarios = await getAllUsuarios();
  return usuarios.find(u => u.email === email && u.password === password) || null;
}

async function registrarUsuario(nombre, email, password) {
  const usuarios = await getAllUsuarios();
  if (usuarios.some(u => u.email === email)) return false;
  const custom = JSON.parse(localStorage.getItem(USUARIOS_CUSTOM_KEY) || '[]');
  custom.push({
    id: 'user_' + Date.now(), nombre, email, password,
    rol: 'Registrado', creado: new Date().toISOString().split('T')[0]
  });
  localStorage.setItem(USUARIOS_CUSTOM_KEY, JSON.stringify(custom));
  return true;
}

/* ---- Helpers ---- */

function escAuth(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function getPaginaActual() {
  const path   = location.pathname.split('/').pop() || 'index.html';
  const search = location.search;
  if (search.includes('filtro=favoritos')) return 'favoritos';
  if (path === '' || path === 'index.html') return 'index.html';
  return path;
}

function buildNavLinks(rol) {
  const activa = getPaginaActual();

  function li(href, label, page) {
    const cls = activa === page ? 'nav-link active' : 'nav-link';
    return `<li class="nav-item"><a class="${cls}" href="${href}">${label}</a></li>`;
  }

  let html = '';
  html += li('index.html',    'Inicio',   'index.html');
  html += li('noticias.html', 'Noticias', 'noticias.html');

  if (rol === 'Registrado' || rol === 'Admin') {
    const cls = activa === 'favoritos' ? 'nav-link active' : 'nav-link';
    html += `<li class="nav-item">
      <a class="${cls}" href="noticias.html?filtro=favoritos">
        <i class="bi bi-heart-fill text-danger"></i> Favoritos
        <span class="badge bg-danger contador-favoritos ms-1" style="display:none">0</span>
      </a>
    </li>`;
  }

  html += li('contacto.html', 'Contacto', 'contacto.html');

  if (rol === 'Admin') {
    html += li('admin.html', 'Administración', 'admin.html');
  }

  return html;
}

function aplicarNavbar() {
  const usuario = getUsuarioActual();
  const rol     = getRol();

  const navLinksEl = document.getElementById('nav-links');
  if (navLinksEl) navLinksEl.innerHTML = buildNavLinks(rol);

  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;

  if (usuario) {
    const badgeClass = rol === 'Admin' ? 'bg-warning text-dark' : 'bg-success';
    navAuth.innerHTML = `
      <span class="navbar-text text-white-50 small me-2 d-none d-lg-inline">
        <i class="bi bi-person-circle me-1"></i>${escAuth(usuario.nombre)}
        <span class="badge ms-1 ${badgeClass}">${escAuth(rol)}</span>
      </span>
      <button class="btn btn-outline-light btn-sm" onclick="logout()">
        <i class="bi bi-box-arrow-right me-1"></i>Salir
      </button>`;
  } else {
    navAuth.innerHTML = `
      <a href="login.html" class="btn btn-outline-light btn-sm">
        <i class="bi bi-person me-1"></i>Ingresar
      </a>
      <a href="login.html" class="btn btn-primary btn-sm">
        <i class="bi bi-person-plus me-1"></i>Registro
      </a>`;
  }
}

/* ============================================================
   Ejecución inicial (scripts al final de <body>, DOM ya listo)
   ============================================================ */
importarSesionDesdeURL(); /* 1. Leer sesión de la URL si viene de otra página */
aplicarNavbar();          /* 2. Renderizar navbar con la sesión actual          */
