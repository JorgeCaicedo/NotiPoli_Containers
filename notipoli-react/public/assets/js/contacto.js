/* =========================================
   contacto.js - Validación del formulario
   de contacto en tiempo real
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-contacto');
  if (!form) return;

  const campos = {
    nombre:  { el: document.getElementById('nombre'),  min: 2,  msg: 'Ingresa tu nombre completo (mín. 2 caracteres).' },
    email:   { el: document.getElementById('email'),   min: 0,  msg: 'Ingresa un correo electrónico válido.' },
    mensaje: { el: document.getElementById('mensaje'), min: 10, msg: 'El mensaje debe tener al menos 10 caracteres.' }
  };

  /** Valida formato de email */
  function esEmailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
  }

  /** Aplica estado visual válido/inválido al campo */
  function setEstado(campo, valido, mensajeError) {
    campo.el.classList.toggle('is-valid', valido);
    campo.el.classList.toggle('is-invalid', !valido);
    const fb = campo.el.nextElementSibling;
    if (fb && fb.classList.contains('invalid-feedback')) {
      fb.textContent = valido ? '' : mensajeError;
    }
  }

  /** Valida un campo individual y retorna boolean */
  function validarCampo(key) {
    const c = campos[key];
    let valido = false;
    if (key === 'email') {
      valido = esEmailValido(c.el.value);
    } else {
      valido = c.el.value.trim().length >= c.min;
    }
    setEstado(c, valido, c.msg);
    return valido;
  }

  /* Validación en tiempo real */
  Object.keys(campos).forEach(key => {
    campos[key].el.addEventListener('input', () => validarCampo(key));
    campos[key].el.addEventListener('blur',  () => validarCampo(key));
  });

  /* Envío del formulario */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const resultados = Object.keys(campos).map(key => validarCampo(key));
    const todoValido = resultados.every(Boolean);

    if (!todoValido) return;

    /* Simula envío y muestra confirmación */
    const btnEnviar = form.querySelector('[type="submit"]');
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando…';

    setTimeout(() => {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = '<i class="bi bi-send-fill me-2"></i>Enviar Mensaje';

      form.reset();
      Object.keys(campos).forEach(key => {
        campos[key].el.classList.remove('is-valid', 'is-invalid');
      });

      const exito = document.getElementById('mensaje-exito');
      if (exito) {
        exito.classList.remove('d-none');
        setTimeout(() => exito.classList.add('d-none'), 5000);
      }
    }, 1200);
  });
});
