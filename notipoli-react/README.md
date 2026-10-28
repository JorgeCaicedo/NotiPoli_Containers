# NotiPoli React - Frontend

Interfaz de usuario para la plataforma NotiPoli, construida con React 19, Vite, Tailwind CSS y Bootstrap 5.

## Tech Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.3 | UI Library |
| Vite | 8.3 | Build tool & Dev Server |
| Tailwind CSS | 4.3 | Utility-first CSS |
| Bootstrap | 5.3 | Componentes UI predefinidos |
| React Router | 7.18 | Routing SPA |
| Oxlint | 1.89 | Linter rápido |

## Estructura del proyecto

```
notipoli-react/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Footer.jsx        # Pie de página
│   │   ├── Header.jsx        # Navegación principal
│   │   ├── HeroSection.jsx   # Sección hero (Home)
│   │   └── NewsCard.jsx      # Tarjeta de noticia
│   ├── pages/                # Páginas / Vistas
│   │   ├── HomePage.jsx      # Página principal
│   │   ├── NewsListPage.jsx  # Listado de noticias
│   │   ├── NewsDetailPage.jsx# Detalle de noticia
│   │   ├── LoginPage.jsx     # Inicio de sesión
│   │   ├── AdminPage.jsx     # Panel de administración
│   │   └── ContactPage.jsx   # Contacto
│   ├── context/              # React Context (estado global)
│   ├── App.jsx               # App root + routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Estilos globales + Tailwind imports
├── public/                   # Assets estáticos
├── index.html                # HTML template
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .oxlintrc.json
```

## Rutas de la aplicación

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | HomePage | Landing page con hero y noticias destacadas |
| `/noticias` | NewsListPage | Listado paginado de noticias |
| `/noticias/:id` | NewsDetailPage | Detalle completo de una noticia |
| `/login` | LoginPage | Autenticación de usuarios |
| `/admin` | AdminPage | Panel de administración (protegido) |
| `/contacto` | ContactPage | Formulario de contacto |

## Scripts disponibles

```bash
npm run dev      # Dev server con HMR (http://localhost:5173)
npm run build    # Build producción (output en /dist)
npm run lint     # Oxlint - análisis estático
npm run preview  # Preview del build local
```

## Instalación y desarrollo

```bash
cd notipoli-react
npm install
npm run dev
```

## Variables de entorno

Crear `.env.local` en la raíz de `notipoli-react/`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=NotiPoli
```

## Build para producción

```bash
npm run build
# Los archivos optimizados están en /dist
# Servir con: nginx, Vercel, Netlify, Cloudflare Pages, etc.
```

## Convenciones de código

- **Componentes**: PascalCase (`NewsCard.jsx`)
- **Hooks personalizados**: camelCase con prefijo `use` (`useAuth.js`)
- **Context**: PascalCase + `Context` (`AuthContext.jsx`)
- **Estilos**: Tailwind CSS utilities + Bootstrap classes cuando sea necesario
- **Linting**: Oxlint configurado en `.oxlintrc.json`

## Integración con Backend

El frontend consume la API REST de `notipoli-node`:

- Base URL: `import.meta.env.VITE_API_URL`
- Autenticación: JWT en header `Authorization: Bearer <token>`
- Endpoints principales definidos en `notipoli-node/README.md`

## Despliegue

### Vercel (recomendado)
1. Conectar repositorio
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Agregar variable `VITE_API_URL` en settings

### Netlify
Similar a Vercel, configurar build command y publish directory.

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Próximos pasos

- [ ] Implementar autenticación completa (login, register, protected routes)
- [ ] Conectar con API real del backend
- [ ] Añadir tests (Vitest + React Testing Library)
- [ ] Configurar Storybook para componentes
- [ ] PWA / Service Worker
- [ ] Internacionalización (i18n)