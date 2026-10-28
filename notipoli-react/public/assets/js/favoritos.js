/* =========================================
   favoritos.js - Gestión de favoritos
   Requiere: auth.js cargado antes
   ========================================= */

const FAVORITOS_KEY_PREFIX = 'notipoli_favoritos';

/** Devuelve la clave de localStorage para el usuario actual.
 *  Si no hay sesión, retorna null para evitar mezclar favoritos. */
function getFavoritosKey() {
  const usuario = (typeof getUsuarioActual === 'function') ? getUsuarioActual() : null;
  if (!usuario || !usuario.id) return null;
  return FAVORITOS_KEY_PREFIX + '_' + usuario.id;
}

function getFavoritos() {
  const key = getFavoritosKey();
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function toggleFavorito(id) {
  const key = getFavoritosKey();
  if (!key) return false;
  const favs  = getFavoritos();
  const strId = String(id);
  const idx   = favs.indexOf(strId);
  if (idx === -1) {
    favs.push(strId);
    localStorage.setItem(key, JSON.stringify(favs));
    return true;
  }
  favs.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(favs));
  return false;
}

function isFavorito(id) {
  return getFavoritos().includes(String(id));
}

function actualizarContadorFavoritos() {
  const count = getFavoritos().length;
  document.querySelectorAll('.contador-favoritos').forEach(el => {
    el.textContent     = count;
    el.style.display   = count > 0 ? 'inline-block' : 'none';
  });
}

function actualizarBotonesFavoritos() {
  document.querySelectorAll('[data-favorito-id]').forEach(btn => {
    const id    = btn.dataset.favoritoId;
    const icon  = btn.querySelector('i');
    const activo = isFavorito(id);
    btn.classList.toggle('activo', activo);
    if (icon) icon.className = activo ? 'bi bi-heart-fill' : 'bi bi-heart';
  });
}

function mostrarToast(mensaje) {
  let toast = document.getElementById('favorito-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'favorito-toast';
    toast.className = 'position-fixed bottom-0 end-0 m-3 px-4 py-2 bg-dark text-white rounded shadow-lg';
    toast.style.cssText = 'z-index:9999;opacity:0;transition:opacity 0.3s ease;font-size:0.9rem;';
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
}

/* Modal para usuarios no autenticados */
function mostrarModalLoginRequerido() {
  const MODAL_ID = 'modal-login-req';
  if (!document.getElementById(MODAL_ID)) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="modal fade" id="${MODAL_ID}" tabindex="-1" aria-labelledby="${MODAL_ID}-label" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold" id="${MODAL_ID}-label">Ingreso requerido</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body text-center py-4">
              <i class="bi bi-heart-fill display-3 text-danger mb-3 d-block"></i>
              <p class="mb-0 fs-6">Para guardar noticias en favoritos debes
                <strong>ingresar</strong> o <strong>registrarte</strong>.</p>
            </div>
            <div class="modal-footer border-0 justify-content-center gap-2 pt-0">
              <a href="login.html" class="btn btn-primary">
                <i class="bi bi-box-arrow-in-right me-1"></i>Ingresar
              </a>
              <a href="login.html#registro" class="btn btn-outline-primary">
                <i class="bi bi-person-plus me-1"></i>Registrarse
              </a>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrapper.firstElementChild);
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById(MODAL_ID)).show();
}

/*
  Importa la lista de favoritos desde el parámetro ?_favs= de la URL.
  Necesario en Firefox file:// donde cada archivo tiene su propio localStorage.
  Nota: auth.js ya procesó ?_s= antes de que este script corra, por lo que
  getUsuarioActual() ya devuelve el usuario correcto y getFavoritosKey() funciona.
*/
function importarFavoritosDesdeURL() {
  const params = new URLSearchParams(location.search);
  const favStr = params.get('_favs');
  if (!favStr) return;
  try {
    const key = getFavoritosKey();
    if (!key) return; /* sin sesión activa, no importar */
    const favs = favStr.split(',').filter(Boolean);
    localStorage.setItem(key, JSON.stringify(favs));
  } catch (_) {}
  params.delete('_favs');
  const newSearch = params.toString() ? '?' + params.toString() : '';
  history.replaceState(null, '', location.pathname + newSearch + location.hash);
}
importarFavoritosDesdeURL();

/* Delegación de eventos para botones de favorito */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-favorito-id]');
  if (!btn) return;

  /* Verificar que el usuario tenga rol Registrado o Admin (via auth.js) */
  const usuario = getUsuarioActual();
  if (!usuario || (usuario.rol !== 'Registrado' && usuario.rol !== 'Admin')) {
    mostrarModalLoginRequerido();
    return;
  }

  const id    = btn.dataset.favoritoId;
  const added = toggleFavorito(id);
  const icon  = btn.querySelector('i');

  if (icon) icon.className = added ? 'bi bi-heart-fill' : 'bi bi-heart';
  btn.classList.toggle('activo', added);
  actualizarContadorFavoritos();

  const label = btn.querySelector('.fav-label');
  if (label) label.textContent = added ? 'En Favoritos' : 'Agregar a Favoritos';

  mostrarToast(added ? '❤️ Agregado a favoritos' : '💔 Eliminado de favoritos');
});
