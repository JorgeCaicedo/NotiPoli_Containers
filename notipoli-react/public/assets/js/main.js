/* =========================================
   main.js - Lógica principal de NotiPoli
   Carga noticias.json con fallback embebido
   para compatibilidad con file:// protocol
   ========================================= */

/* Datos embebidos de respaldo (se usan si fetch falla con file://) */
const FALLBACK_NOTICIAS = [
  {
    id: 1, titulo: "El Politécnico inaugura su nueva Biblioteca Digital con más de 10,000 recursos",
    categoria: "Educacion", imagen: "https://picsum.photos/seed/poli-edu1/800/500",
    extracto: "Con más de 10,000 recursos académicos disponibles las 24 horas, la nueva plataforma digital revoluciona el acceso al conocimiento para toda la comunidad académica del Poli.",
    contenido: "El Politécnico Grancolombiano Jaime Isaza Cadavid dio un gran paso hacia la modernización educativa con la inauguración de su Biblioteca Digital Integrada, un proyecto que tardó tres años en desarrollo.\n\nLa plataforma cuenta con acceso a más de 10,000 recursos académicos entre libros electrónicos, revistas científicas, tesis de grado y artículos de investigación. Todo el contenido está disponible las 24 horas del día, los 7 días de la semana.\n\n\"Este es un logro histórico para nuestra institución. Ahora nuestros estudiantes tienen acceso a los mismos recursos que las mejores universidades del mundo\", destacó el rector.\n\nLa biblioteca también integra herramientas de IA que ayudan a los usuarios a encontrar recursos relevantes y un sistema de recomendaciones personalizadas.",
    fecha: "2026-09-15", autor: "Redacción NotiPoli", destacada: true
  },
  {
    id: 2, titulo: "Laboratorio de Inteligencia Artificial abre sus puertas a estudiantes de Ingeniería",
    categoria: "Tecnologia", imagen: "https://picsum.photos/seed/poli-tech1/800/500",
    extracto: "El nuevo laboratorio de IA ofrece a los estudiantes de ingeniería acceso a equipos de última generación para investigación y desarrollo en machine learning y robótica.",
    contenido: "El Politécnico inauguró su nuevo Laboratorio de Inteligencia Artificial, equipado con 30 estaciones de trabajo de alto rendimiento, servidores GPU dedicados y los últimos modelos de robots colaborativos.\n\nEste laboratorio representa una inversión de más de 2,000 millones de pesos y está disponible para todos los estudiantes de Ingeniería de Sistemas, Electrónica y Mecatrónica.\n\n\"Queremos que nuestros graduados sean competitivos a nivel global en el campo de la inteligencia artificial\", afirmó el decano de la Facultad de Ingenierías.",
    fecha: "2026-09-10", autor: "Redacción NotiPoli", destacada: false
  },
  {
    id: 3, titulo: "Festival de Turismo Cultural celebra la diversidad de Antioquia en el campus",
    categoria: "Turismo", imagen: "https://picsum.photos/seed/poli-tur1/800/500",
    extracto: "El campus acoge el primer festival de turismo cultural con la participación de más de 20 municipios antioqueños, mostrando artesanías, gastronomía y tradiciones locales.",
    contenido: "Durante tres días, el campus del Politécnico se convirtió en el escenario del Primer Festival de Turismo Cultural de Antioquia, reuniendo representantes de más de 20 municipios.\n\nEl festival contó con stands temáticos, presentaciones folclóricas, conciertos de música tradicional y talleres de cocina regional.\n\nMás de 5,000 personas visitaron el evento durante los tres días de celebración, superando ampliamente las expectativas.",
    fecha: "2026-09-05", autor: "Redacción NotiPoli", destacada: false
  },
  {
    id: 4, titulo: "Feria de Emprendimiento del Poli: 50 proyectos compiten por inversión seed",
    categoria: "Comercio", imagen: "https://picsum.photos/seed/poli-com1/800/500",
    extracto: "La Feria Anual de Emprendimiento del Poli reúne a 50 proyectos estudiantiles con innovadoras propuestas de negocio que buscan transformar sus sectores.",
    contenido: "La décima edición de la Feria de Emprendimiento batió todos los récords: 50 proyectos compitieron por fondos seed de hasta 50 millones de pesos, con más de 30 inversionistas ángeles presentes.\n\nEl primer lugar fue para \"AgroTech Poli\", una startup de agricultura de precisión con sensores IoT. El segundo lugar fue para \"MediApp\", una app de telemedicina para comunidades rurales.\n\nEn total, los inversionistas comprometieron más de 500 millones de pesos para financiar los 10 mejores proyectos.",
    fecha: "2026-09-01", autor: "Redacción NotiPoli", destacada: false
  },
  {
    id: 5, titulo: "Cinco universidades europeas firman convenios de doble titulación con el Poli",
    categoria: "Educacion", imagen: "https://picsum.photos/seed/poli-edu2/800/500",
    extracto: "El Poli firma convenios con 5 universidades europeas para ofrecer programas de doble titulación que permitirán a estudiantes obtener diplomas de Colombia y Europa.",
    contenido: "El Politécnico firmó acuerdos de doble titulación con cinco instituciones europeas: Universidad Politécnica de Madrid, Universidad Técnica de Munich, INSA de Lyon, Universidad de Bolonia y Universidad de Porto.\n\nEstos convenios permitirán que estudiantes de Ingeniería, Arquitectura y Administración cursen semestres en Europa y obtengan títulos reconocidos en ambos países.\n\n\"Este es un paso fundamental para la internacionalización del Poli\", señaló el Vicerrector Académico.",
    fecha: "2026-08-28", autor: "Redacción NotiPoli", destacada: false
  },
  {
    id: 6, titulo: "App del Poli supera las 10,000 descargas y suma nuevas funcionalidades",
    categoria: "Tecnologia", imagen: "https://picsum.photos/seed/poli-tech2/800/500",
    extracto: "La aplicación móvil oficial del Politécnico alcanza un hito histórico con más de 10,000 descargas y lanza nuevas funciones de agenda académica y servicios estudiantiles.",
    contenido: "Apenas cuatro semanas después de su lanzamiento, la app del Politécnico superó las 10,000 descargas, convirtiéndose en la app educativa más descargada de Medellín en agosto.\n\nLa versión 2.0 incorpora el Sistema de Reserva de Espacios, el módulo de Pagos Digitales y un Asistente Virtual con IA disponible las 24 horas.\n\n\"El éxito de esta app demuestra que nuestros estudiantes son capaces de desarrollar productos de clase mundial\", afirmó el director del programa.",
    fecha: "2026-08-20", autor: "Redacción NotiPoli", destacada: false
  },
  {
    id: 7, titulo: "Ruta de Turismo Científico: el campus como destino de innovación y aprendizaje",
    categoria: "Turismo", imagen: "https://picsum.photos/seed/poli-tur2/800/500",
    extracto: "El Poli lanza una ruta turística guiada que recorre sus laboratorios, centros de investigación y espacios creativos, abierta al público general los fines de semana.",
    contenido: "El Politécnico lanzó la \"Ruta de Turismo Científico Poli\", que convierte el campus en un destino turístico. Cada sábado, grupos de 20 personas recorren los espacios más innovadores del campus.\n\nLa ruta incluye el Laboratorio de IA, el Centro de Fabricación Digital, el Laboratorio de Biotecnología y el estudio de Radio y TV.\n\nEn su primer mes de operación, más de 800 personas visitaron el campus. También se ofrecen visitas especiales para grupos escolares entre semana.",
    fecha: "2026-08-15", autor: "Redacción NotiPoli", destacada: false
  },
  {
    id: 8, titulo: "Multinacional crea 200 plazas laborales exclusivas para egresados del Poli",
    categoria: "Comercio", imagen: "https://picsum.photos/seed/poli-com2/800/500",
    extracto: "Una nueva alianza estratégica genera más de 200 oportunidades laborales inmediatas para egresados en el sector comercial y de tecnología de la información.",
    contenido: "El Politécnico y TechGlobal Colombia S.A.S. firmaron un acuerdo que creará 200 plazas de empleo exclusivas para egresados durante el próximo año, en áreas de desarrollo de software, análisis de datos y comercio electrónico.\n\nAdicionalmente, TechGlobal financiará bootcamps intensivos de 6 semanas para 500 estudiantes actuales del Poli en cloud computing, ciberseguridad y DevOps.\n\n\"Esta alianza demuestra la confianza del sector empresarial en la calidad académica del Poli\", expresó el Director de Egresados.",
    fecha: "2026-08-10", autor: "Redacción NotiPoli", destacada: false
  }
];

/* ---- Importación de noticias custom desde URL (Firefox file:// fix) ---- */
(function importarNoticiasDesdeURL() {
  const params = new URLSearchParams(location.search);
  const encoded = params.get('_cnews');
  if (!encoded) return;
  try {
    const json = decodeURIComponent(atob(encoded));
    JSON.parse(json); /* validar que sea JSON válido */
    localStorage.setItem('notipoli_noticias_custom', json);
  } catch (_) {}
  params.delete('_cnews');
  const newSearch = params.toString() ? '?' + params.toString() : '';
  history.replaceState(null, '', location.pathname + newSearch + location.hash);
})();

/* ---- Utilidades ---- */

/** Carga noticias.json; usa FALLBACK_NOTICIAS si fetch falla */
async function cargarNoticiasBD() {
  try {
    const resp = await fetch('assets/data/noticias.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return await resp.json();
  } catch (_) {
    return FALLBACK_NOTICIAS;
  }
}

/** Combina noticias JSON con las personalizadas del localStorage */
async function getAllNoticias() {
  const base = await cargarNoticiasBD();
  const custom = JSON.parse(localStorage.getItem('notipoli_noticias_custom') || '[]');
  return [...custom, ...base];
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

const CAT_CLASS = { Educacion: 'educacion', Tecnologia: 'tecnologia', Turismo: 'turismo', Comercio: 'comercio' };
const CAT_LABEL = { Educacion: 'Educación', Tecnologia: 'Tecnología', Turismo: 'Turismo', Comercio: 'Comercio' };

function catClass(c) { return CAT_CLASS[c] || 'primary'; }
function catLabel(c) { return CAT_LABEL[c] || c; }

function imgFallback(id) {
  return 'https://picsum.photos/seed/' + id + '/800/500';
}

/* Escapa texto para insertar en HTML */
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ============================================================
   HOME PAGE
   ============================================================ */
function renderHero(noticia) {
  const section = document.getElementById('hero-section');
  if (!section) return;

  const favIcon = isFavorito(noticia.id) ? 'bi-heart-fill' : 'bi-heart';

  section.innerHTML = `
    <div class="hero-feature">
      <img src="${esc(noticia.imagen)}" alt="${esc(noticia.titulo)}" class="hero-img"
           onerror="this.src='${imgFallback(noticia.id)}'">
      <div class="hero-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end">
        <div class="container pb-4 pb-md-5">
          <span class="badge badge-${catClass(noticia.categoria)} mb-2 px-3 py-2">${catLabel(noticia.categoria)}</span>
          <h1 class="hero-title text-white fw-bold mb-3">${esc(noticia.titulo)}</h1>
          <p class="text-white-50 mb-4 d-none d-md-block" style="max-width:640px">${esc(noticia.extracto)}</p>
          <div class="d-flex align-items-center flex-wrap gap-3">
            <a href="detalle.html?id=${noticia.id}" class="btn btn-light btn-lg fw-semibold px-4">
              <i class="bi bi-book-open me-2"></i>Leer artículo
            </a>
            <button class="btn btn-outline-light btn-lg btn-favorito" data-favorito-id="${noticia.id}" title="Favorito">
              <i class="bi ${favIcon}"></i>
            </button>
            <small class="text-white-50">
              <i class="bi bi-calendar3 me-1"></i>${formatearFecha(noticia.fecha)}
            </small>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderGrid(noticias) {
  const container = document.getElementById('grid-noticias');
  if (!container) return;

  if (!noticias.length) {
    container.innerHTML = '<p class="text-muted">No hay noticias disponibles.</p>';
    return;
  }

  container.innerHTML = noticias.map((n, i) => {
    const col = (i === 0) ? 'col-12 col-md-6' : (i < 3) ? 'col-6 col-md-3' : 'col-12 col-md-4';
    const imgH = (i === 0) ? '260px' : (i < 3) ? '160px' : '200px';
    const favIcon = isFavorito(n.id) ? 'bi-heart-fill' : 'bi-heart';
    const extractoCorto = esc(n.extracto).substring(0, 110) + '…';

    return `
      <div class="${col}">
        <div class="card noticia-card h-100">
          <div class="position-relative overflow-hidden">
            <img src="${esc(n.imagen)}" class="card-img-top" alt="${esc(n.titulo)}"
                 style="height:${imgH};object-fit:cover"
                 onerror="this.src='${imgFallback(n.id)}'">
            <span class="badge badge-${catClass(n.categoria)} position-absolute top-0 start-0 m-2">${catLabel(n.categoria)}</span>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${esc(n.titulo)}</h5>
            <p class="card-text text-muted small flex-grow-1">${extractoCorto}</p>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <a href="detalle.html?id=${n.id}" class="btn btn-primary btn-sm">Leer más</a>
              <button class="btn-favorito ${isFavorito(n.id) ? 'activo' : ''}" data-favorito-id="${n.id}">
                <i class="bi ${favIcon}"></i>
              </button>
            </div>
          </div>
          <div class="card-footer">
            <i class="bi bi-calendar3 me-1"></i>${formatearFecha(n.fecha)}
          </div>
        </div>
      </div>`;
  }).join('');
}

async function initHome() {
  const noticias = await getAllNoticias();
  const destacada = noticias.find(n => n.destacada) || noticias[0];
  renderHero(destacada);
  renderGrid(noticias.filter(n => String(n.id) !== String(destacada.id)).slice(0, 6));
  actualizarContadorFavoritos();
}

/* ============================================================
   NOTICIAS PAGE
   ============================================================ */
function renderCards(noticias) {
  const container = document.getElementById('cards-noticias');
  if (!container) return;

  if (!noticias.length) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-newspaper display-1 text-muted"></i>
        <p class="text-muted mt-3 fs-5">No se encontraron noticias para este filtro.</p>
        <a href="noticias.html" class="btn btn-outline-primary mt-2">Ver todas las noticias</a>
      </div>`;
    return;
  }

  container.innerHTML = noticias.map(n => {
    const favIcon = isFavorito(n.id) ? 'bi-heart-fill' : 'bi-heart';
    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card noticia-card h-100">
          <div class="position-relative overflow-hidden">
            <img src="${esc(n.imagen)}" class="card-img-top" alt="${esc(n.titulo)}"
                 style="height:220px;object-fit:cover"
                 onerror="this.src='${imgFallback(n.id)}'">
            <span class="badge badge-${catClass(n.categoria)} position-absolute top-0 start-0 m-2">${catLabel(n.categoria)}</span>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${esc(n.titulo)}</h5>
            <p class="card-text text-muted small flex-grow-1">${esc(n.extracto)}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <a href="detalle.html?id=${n.id}" class="btn btn-primary btn-sm">
                <i class="bi bi-book-open me-1"></i>Leer más
              </a>
              <button class="btn-favorito ${isFavorito(n.id) ? 'activo' : ''}" data-favorito-id="${n.id}">
                <i class="bi ${favIcon}"></i>
              </button>
            </div>
          </div>
          <div class="card-footer">
            <i class="bi bi-calendar3 me-1"></i>${formatearFecha(n.fecha)}
            <span class="float-end"><i class="bi bi-person me-1"></i>${esc(n.autor)}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

async function initNoticias() {
  const noticias = await getAllNoticias();
  const params = new URLSearchParams(location.search);
  const categoria = params.get('categoria');
  const filtro = params.get('filtro');

  let filtradas = noticias;
  let titulo = 'Todas las Noticias';

  if (filtro === 'favoritos') {
    const favs = getFavoritos();
    filtradas = noticias.filter(n => favs.includes(String(n.id)));
    titulo = 'Mis Favoritos';
  } else if (categoria) {
    filtradas = noticias.filter(n => n.categoria === categoria);
    titulo = catLabel(categoria);
  }

  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titulo;

  /* Marca el botón de filtro activo */
  document.querySelectorAll('[data-filter]').forEach(btn => {
    const activo =
      (btn.dataset.filter === 'todos' && !categoria && filtro !== 'favoritos') ||
      (btn.dataset.filter === categoria) ||
      (btn.dataset.filter === filtro);
    btn.classList.toggle('active', activo);
  });

  /* Contador de resultados */
  const countEl = document.getElementById('resultado-count');
  if (countEl) countEl.textContent = `${filtradas.length} noticia${filtradas.length !== 1 ? 's' : ''}`;

  renderCards(filtradas);
  actualizarContadorFavoritos();
}

/* ============================================================
   DETALLE PAGE
   ============================================================ */
function renderDetalle(noticia) {
  const container = document.getElementById('detalle-content');
  if (!container) return;

  const parrafos = noticia.contenido
    .split('\n')
    .filter(p => p.trim())
    .map(p => `<p>${esc(p)}</p>`)
    .join('');

  const favIcon = isFavorito(noticia.id) ? 'bi-heart-fill' : 'bi-heart';
  const favLabel = isFavorito(noticia.id) ? 'En Favoritos' : 'Agregar a Favoritos';

  container.innerHTML = `
    <div class="row g-4 g-lg-5">
      <div class="col-lg-8">
        <span class="badge badge-${catClass(noticia.categoria)} mb-3 px-3 py-2">${catLabel(noticia.categoria)}</span>
        <h1 class="fw-bold lh-sm mb-3">${esc(noticia.titulo)}</h1>
        <div class="d-flex flex-wrap gap-3 text-muted small mb-4">
          <span><i class="bi bi-calendar3 me-1"></i>${formatearFecha(noticia.fecha)}</span>
          <span><i class="bi bi-person me-1"></i>${esc(noticia.autor)}</span>
        </div>
        <img src="${esc(noticia.imagen)}" alt="${esc(noticia.titulo)}"
             class="img-fluid detalle-img w-100 mb-4"
             onerror="this.src='${imgFallback(noticia.id)}'">
        <div class="article-body">${parrafos}</div>
      </div>

      <div class="col-lg-4">
        <div class="sidebar">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body text-center p-4">
              <h6 class="fw-bold mb-3">¿Te gustó esta noticia?</h6>
              <button class="btn btn-outline-danger btn-lg w-100 mb-2 btn-favorito ${isFavorito(noticia.id) ? 'activo' : ''}"
                      data-favorito-id="${noticia.id}">
                <i class="bi ${favIcon} me-2"></i>
                <span class="fav-label">${favLabel}</span>
              </button>
              <a href="noticias.html" class="btn btn-outline-secondary btn-sm w-100 mt-2">
                <i class="bi bi-arrow-left me-1"></i>Volver a Noticias
              </a>
            </div>
          </div>

          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="fw-bold mb-3"><i class="bi bi-info-circle me-2 text-primary"></i>Información</h6>
              <ul class="list-unstyled small text-muted mb-0">
                <li class="mb-2"><strong>Categoría:</strong> ${catLabel(noticia.categoria)}</li>
                <li class="mb-2"><strong>Publicado:</strong> ${formatearFecha(noticia.fecha)}</li>
                <li class="mb-0"><strong>Autor:</strong> ${esc(noticia.autor)}</li>
              </ul>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="fw-bold mb-3"><i class="bi bi-share me-2 text-primary"></i>Compartir</h6>
              <div class="d-flex gap-2">
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}"
                   target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm flex-grow-1">
                  <i class="bi bi-facebook"></i> Facebook
                </a>
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(noticia.titulo)}&url=${encodeURIComponent(location.href)}"
                   target="_blank" rel="noopener" class="btn btn-outline-dark btn-sm flex-grow-1">
                  <i class="bi bi-twitter-x"></i> X
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

async function initDetalle() {
  const id = new URLSearchParams(location.search).get('id');
  const container = document.getElementById('detalle-content');

  if (!id) {
    container.innerHTML = '<p class="text-danger">No se especificó una noticia.</p>';
    return;
  }

  const noticias = await getAllNoticias();
  const noticia = noticias.find(n => String(n.id) === String(id));

  if (!noticia) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-exclamation-circle display-1 text-muted"></i>
        <p class="text-muted mt-3 fs-5">Noticia no encontrada.</p>
        <a href="noticias.html" class="btn btn-primary">Ver todas las noticias</a>
      </div>`;
    return;
  }

  document.title = noticia.titulo + ' — NotiPoli';
  renderDetalle(noticia);
  actualizarContadorFavoritos();
}

/* Navbar gestionado por auth.js */
