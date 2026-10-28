# NotiPoli

Portal de noticias del **Politécnico Grancolombiano**, desarrollado como proyecto frontend estático. Permite consultar noticias por categoría, guardar favoritos, registrarse e iniciar sesión, y administrar noticias desde un panel de administración.

---

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura de todas las páginas |
| CSS3 | Estilos personalizados (`assets/css/styles.css`) |
| JavaScript (ES6+) | Lógica de autenticación, favoritos, CRUD y renderizado |
| [Bootstrap 5.3](https://getbootstrap.com/) | Componentes UI, grid, modales, navbar |
| [Bootstrap Icons 1.11](https://icons.getbootstrap.com/) | Iconografía |
| localStorage | Persistencia de sesión, favoritos y noticias personalizadas |
| GitHub Pages | Despliegue estático |

---

## Estructura del proyecto

```
NotiPoli/
├── index.html          # Página de inicio con hero y grid de noticias
├── noticias.html       # Listado con filtros por categoría y favoritos
├── detalle.html        # Vista completa de una noticia
├── contacto.html       # Formulario de contacto e información
├── admin.html          # Panel de administración (solo Admin)
├── login.html          # Ingreso y registro de usuarios
│
└── assets/
    ├── css/
    │   └── styles.css          # Estilos globales y componentes custom
    ├── js/
    │   ├── auth.js             # Autenticación, roles y navbar dinámica
    │   ├── favoritos.js        # Gestión de noticias favoritas
    │   ├── main.js             # Carga y renderizado de noticias
    │   ├── crud.js             # Crear y eliminar noticias (Admin)
    │   └── contacto.js         # Validación del formulario de contacto
    └── data/
        ├── noticias.json       # Noticias base del portal
        └── usuarios.json       # Usuarios base (Admin y Registrado)
```

---

## Funcionalidades

- **Inicio**: hero con la noticia destacada y grid con las más recientes.
- **Noticias**: filtrado por categoría (Educación, Tecnología, Turismo, Comercio) y por favoritos.
- **Detalle**: lectura completa del artículo con opción de agregar a favoritos.
- **Favoritos**: guardado por usuario autenticado, persistido en localStorage.
- **Autenticación**: inicio de sesión y registro. Tres roles: `Admin`, `Registrado` y anónimo.
- **Administración**: crear y eliminar noticias (acceso restringido a `Admin`).
- **Contacto**: formulario con validación del lado cliente.

---

## Roles de usuario

| Rol | Acceso |
|-----|--------|
| Anónimo | Inicio, Noticias, Detalle, Contacto |
| Registrado | Todo lo anterior + Favoritos |
| Admin | Todo lo anterior + Panel de Administración |

---

## Cómo ejecutar localmente

El proyecto funciona abriendo `index.html` directamente en el navegador o, preferiblemente, con un servidor local para evitar restricciones del protocolo `file://`:

**Con VS Code — Live Server:**
1. Instalar la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
2. Click derecho sobre `index.html` → **Open with Live Server**.
3. Se abre en `http://localhost:5500`.

---

## Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | `jorge.caicedo@admin.com` | `Admin@2026` |
| Registrado | `jorge.caicedo@registrado.com` | `Registrado@2026` |

> Los usuarios registrados desde el formulario se guardan en localStorage del navegador.
