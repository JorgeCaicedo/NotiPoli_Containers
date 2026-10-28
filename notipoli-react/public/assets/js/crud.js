/* =========================================
   crud.js - Mini CRUD para administración
   de noticias (localStorage)
   ========================================= */

const CRUD_KEY = 'notipoli_noticias_custom';

/** Retorna las noticias personalizadas del localStorage */
function getNoticiasCustom() {
  return JSON.parse(localStorage.getItem(CRUD_KEY) || '[]');
}

/** Persiste el array de noticias en localStorage */
function saveNoticiasCustom(noticias) {
  localStorage.setItem(CRUD_KEY, JSON.stringify(noticias));
}

/** Genera un ID único basado en timestamp */
function generarId() {
  return 'custom_' + Date.now();
}

/** Crea una nueva noticia y la agrega al inicio del array */
function crearNoticia(data) {
  const noticias = getNoticiasCustom();
  const nueva = {
    id: generarId(),
    titulo: data.titulo,
    categoria: data.categoria,
    imagen: data.imagen || ('https://picsum.photos/seed/' + Date.now() + '/800/500'),
    extracto: data.extracto,
    contenido: data.contenido,
    fecha: data.fecha || new Date().toISOString().split('T')[0],
    autor: data.autor || 'Admin NotiPoli',
    destacada: false
  };
  noticias.unshift(nueva);
  saveNoticiasCustom(noticias);
  return nueva;
}

/** Elimina una noticia por su ID */
function eliminarNoticia(id) {
  const noticias = getNoticiasCustom().filter(n => String(n.id) !== String(id));
  saveNoticiasCustom(noticias);
}

/** Formatea una fecha ISO a texto legible en español */
function formatearFechaCrud(fecha) {
  if (!fecha) return '-';
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

/** Escapa HTML para evitar XSS en atributos generados */
function escAttr(str) {
  return String(str).replace(/['"&<>]/g, c => ({'\'': '&#39;', '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
}

/** Renderiza la tabla de administración */
function renderTablaAdmin() {
  const tbody = document.getElementById('tabla-noticias-body');
  if (!tbody) return;

  const noticias = getNoticiasCustom();

  if (noticias.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-5">
          <i class="bi bi-inbox display-4 d-block mb-2"></i>
          No hay noticias creadas. Usa el formulario para agregar la primera.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = noticias.map(n => `
    <tr>
      <td class="fw-semibold">${escAttr(n.titulo)}</td>
      <td><span class="badge badge-${n.categoria.toLowerCase()}">${n.categoria}</span></td>
      <td class="text-muted small">${escAttr(n.autor)}</td>
      <td class="text-muted small">${formatearFechaCrud(n.fecha)}</td>
      <td>
        <a href="detalle.html?id=${escAttr(n.id)}" class="btn btn-sm btn-outline-primary me-1" target="_blank" title="Ver noticia">
          <i class="bi bi-eye"></i>
        </a>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmarEliminar('${escAttr(n.id)}', '${escAttr(n.titulo)}')" title="Eliminar">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/** Solicita confirmación antes de eliminar */
function confirmarEliminar(id, titulo) {
  if (!confirm(`¿Eliminar la noticia "${titulo}"?\n\nEsta acción no se puede deshacer.`)) return;
  eliminarNoticia(id);
  renderTablaAdmin();
  mostrarAlertaCrud('Noticia eliminada correctamente.', 'success');
}

/** Muestra un alert temporal en la página de administración */
function mostrarAlertaCrud(mensaje, tipo) {
  const alertEl = document.getElementById('crud-alerta');
  if (!alertEl) return;
  alertEl.className = `alert alert-${tipo} alert-dismissible fade show`;
  alertEl.querySelector('.alert-msg').textContent = mensaje;
  alertEl.classList.remove('d-none');
  setTimeout(() => alertEl.classList.add('d-none'), 4500);
}

/* ---- Inicialización ---- */
document.addEventListener('DOMContentLoaded', function () {
  renderTablaAdmin();

  const form = document.getElementById('form-crear-noticia');
  if (!form) return;

  /* Rellena la fecha con hoy por defecto */
  const inputFecha = document.getElementById('admin-fecha');
  if (inputFecha && !inputFecha.value) {
    inputFecha.value = new Date().toISOString().split('T')[0];
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = {
      titulo:    document.getElementById('admin-titulo').value.trim(),
      categoria: document.getElementById('admin-categoria').value,
      imagen:    document.getElementById('admin-imagen').value.trim(),
      extracto:  document.getElementById('admin-extracto').value.trim(),
      contenido: document.getElementById('admin-contenido').value.trim(),
      fecha:     document.getElementById('admin-fecha').value,
      autor:     document.getElementById('admin-autor').value.trim()
    };

    if (!data.titulo || !data.categoria || !data.extracto || !data.contenido) {
      mostrarAlertaCrud('Completa todos los campos obligatorios (*)  antes de continuar.', 'warning');
      return;
    }

    crearNoticia(data);
    form.reset();
    if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];
    renderTablaAdmin();
    mostrarAlertaCrud('¡Noticia creada exitosamente! Ya está visible en el sitio.', 'success');

    /* Scroll a la tabla */
    document.getElementById('tabla-admin')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
