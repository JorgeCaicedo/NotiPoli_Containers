# NotiPoli

Plataforma de noticias y comunicación para la comunidad policial.

## Estructura del Proyecto

```
NotiPoli/
├── docker-compose.yml          # Orquesta: postgres + backend + frontend
├── .env.example                # Variables de entorno (plantilla)
├── notipoli-node/              # Backend API (Fastify + Prisma + PostgreSQL)
└── notipoli-react/             # Frontend (React 19 + Vite + Tailwind + Bootstrap)
```

---

## Arquitectura Docker (Producción)

### 3 Contenedores + 2 Volúmenes Persistentes

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network (notipoli-net)            │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   frontend   │───►│   backend    │───►│   postgres   │  │
│  │   (nginx)    │    │  (Fastify)   │    │  (PostgreSQL)│  │
│  │   :80/443    │    │   :3000      │    │   :5432      │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   (estático) │    │ uploads_data │    │ postgres_data│  │
│  │  (volumen    │    │   (volumen)  │    │   (volumen)  │  │
│  │   opcional)  │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **frontend** | 80, 443 | Nginx sirviendo React build + proxy `/api/*` → backend |
| **backend** | 3000 (interno) | API REST Fastify + Prisma ORM |
| **postgres** | 5432 (interno) | Base de datos PostgreSQL 16 |

### Volúmenes Persistentes

| Volumen | Mount Point | Contenido |
|---------|-------------|-----------|
| `postgres_data` | `/var/lib/postgresql/data` | Base de datos completa (tablas, índices, datos) |
| `uploads_data` | `/app/uploads` | Archivos subidos (imágenes noticias, avatares, PDFs, docs) |

---

## Inicio Rápido (Producción)

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

**Editar `.env` con valores seguros:**

```bash
# Generar secrets seguros:
openssl rand -base64 32  # Para DB_PASSWORD
openssl rand -base64 64  # Para JWT_SECRET y JWT_REFRESH_SECRET (cada uno distinto)
```

### 2. Levantar todo

```bash
docker compose up -d --build
```

### 3. Inicializar base de datos (primera vez)

```bash
# Ejecutar migraciones
docker compose exec backend npx prisma migrate deploy

# Poblar datos iniciales (admin, categorías, tags, noticia de ejemplo)
docker compose exec backend npx prisma db seed
```

### 4. Verificar

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost |
| **API Backend** | http://localhost/api |
| **Swagger Docs** | http://localhost/api/docs |
| **Health Check** | http://localhost/health |

---

## Credenciales por Defecto (Seed)

Después de ejecutar `npx prisma db seed`:

| Rol | Email | Contraseña | Menús |
|-----|-------|------------|-------|
| **Admin** | `admin@notipoli.com` | `admin123` | Panel, Noticias, Categorías, Etiquetas, Usuarios, Configuración, Favoritos |
| **Editor** | `editor@notipoli.com` | `editor123` | Noticias, Categorías, Etiquetas, Favoritos |

> ⚠️ **Cambia estas contraseñas inmediatamente en producción**

### Usuarios adicionales creados manualmente

| Rol | Email | Contraseña | Menús |
|-----|-------|------------|-------|
| **VIEWER** | `registrado@notipoli.com` | `editor123` | Inicio, Noticias, Contacto, Favoritos |

---

## Desarrollo Local

### Backend + DB en Docker, Frontend local (HMR)

```bash
# Terminal 1: Backend + PostgreSQL
cd notipoli-node
cp .env.example .env
docker compose up -d postgres
# Editar .env con DATABASE_URL=postgresql://notipoli:password@localhost:5432/notipoli
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Terminal 2: Frontend con HMR
cd notipoli-react
cp .env.example .env.local
npm install
npm run dev
# Frontend en http://localhost:5173 con proxy /api → localhost:3000
```

### Todo en Docker (Desarrollo)

```bash
# Usar docker-compose.override.yml para desarrollo con hot-reload
# (pendiente de crear)
```

---

## Variables de Entorno

### Root (`.env`)

```env
# General
NODE_ENV=production

# Database
DB_PASSWORD=changeme_secure_password_here

# Auth (JWT)
JWT_SECRET=changeme_jwt_secret_at_least_32_chars_long
JWT_REFRESH_SECRET=changeme_refresh_secret_different_from_above
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Backend
PORT=3000
FRONTEND_URL=http://localhost
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
```

### Backend (`notipoli-node/.env`)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://notipoli:password@postgres:5432/notipoli?schema=public
JWT_SECRET=dev_jwt_secret_change_in_production_min_32_chars
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=debug
```

### Frontend (`notipoli-react/.env.local`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=NotiPoli
```

---

## API Endpoints

### Autenticación
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | Público |
| POST | `/api/auth/register` | Registro de usuario | Público |
| POST | `/api/auth/refresh` | Renovar access token | Público |
| POST | `/api/auth/logout` | Cerrar sesión | Usuario |
| GET | `/api/auth/me` | Perfil usuario actual | Usuario |
| GET | `/api/auth/menus` | Menús según rol del usuario | Usuario |

### Noticias
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/news` | Listar noticias (paginado, filtros) | Público* |
| GET | `/api/news/slug/:slug` | Detalle por slug | Público* |
| GET | `/api/news/:id` | Detalle por ID | Admin/Editor |
| POST | `/api/news` | Crear noticia | Admin/Editor |
| PUT | `/api/news/:id` | Actualizar noticia | Admin/Editor |
| DELETE | `/api/news/:id` | Eliminar noticia | Admin |

*Público = solo noticias `PUBLISHED` con `publishedAt <= now()`

### Usuarios
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Mi perfil | Usuario |
| PUT | `/api/users/me` | Actualizar mi perfil | Usuario |
| PUT | `/api/users/me/password` | Cambiar contraseña | Usuario |
| GET | `/api/users/:id` | Perfil público | Público |
| GET | `/api/users` | Listar usuarios | Admin |
| PUT | `/api/users/:id` | Actualizar usuario | Admin |
| DELETE | `/api/users/:id` | Eliminar usuario | Admin |

### Subida de Archivos
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/uploads` | Subir archivo | Admin/Editor |
| GET | `/api/uploads/:filename` | Descargar/ver archivo | Público |
| GET | `/api/uploads` | Listar subidas | Admin |
| DELETE | `/api/uploads/:id` | Eliminar subida | Admin |

**Tipos permitidos:** JPEG, PNG, GIF, WebP, PDF, DOC, DOCX (max 10MB)

### Admin
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Estadísticas del dashboard |
| GET | `/api/admin/users` | Gestión de usuarios (paginado) |

### Categorías & Tags
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Listar categorías |
| GET | `/api/tags` | Listar tags |
| CRUD | `/api/categories`, `/api/tags` | Admin only |

### Configuración
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/settings` | Listar settings | Público |
| PUT | `/api/settings/:key` | Actualizar setting (admin) | Admin |

### Favoritos
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/favorites` | Listar noticias favoritas del usuario | Usuario |
| POST | `/api/favorites` | Agregar noticia a favoritos | Usuario |
| DELETE | `/api/favorites/:newsId` | Quitar noticia de favoritos | Usuario |
| GET | `/api/favorites/:newsId` | Verificar si noticia es favorita | Usuario |

---

## Comandos Útiles

```bash
# Ver logs
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f frontend

# Backup base de datos
docker compose exec postgres pg_dump -U notipoli notipoli > backup_$(date +%F).sql

# Restaurar base de datos
cat backup_2026-10-27.sql | docker compose exec -T postgres psql -U notipoli notipoli

# Backup uploads
tar -czf uploads_backup_$(date +%F).tar.gz -C /var/lib/docker/volumes/notipoli_uploads_data/_data .

# Entrar a contenedores
docker compose exec backend sh
docker compose exec postgres psql -U notipoli notipoli

# Prisma Studio (GUI para BD)
docker compose exec backend npx prisma studio

# Rebuild solo backend
docker compose build backend && docker compose up -d backend

# Parar todo
docker compose down

# Parar y borrar volúmenes (¡CUIDADO: borra datos!)
docker compose down -v
```

---

## Estructura de Carpetas Detallada

### Backend (`notipoli-node/`)

```
notipoli-node/
├── Dockerfile                 # Multi-stage: deps → build → runner
├── .dockerignore
├── .env.example
├── package.json               # Fastify, Prisma, Zod, JWT, Swagger
├── tsconfig.json              # Path aliases @/*
├── prisma/
│   ├── schema.prisma          # Modelos: User, News, Category, Tag, Upload, Setting, Favorite, RoleMenu
│   ├── init.sql               # Extensiones PG (uuid, pg_trgm)
│   └── seed.ts                # Datos iniciales
└── src/
    ├── index.ts               # Bootstrap Fastify
    ├── config/                # env validation (Zod), Prisma client singleton
    ├── plugins/               # CORS, Helmet, JWT (access+refresh), Swagger, Rate-limit, Multipart
    ├── middleware/            # Error handler, Auth (JWT + roles)
    ├── services/              # roleMenuService, favoriteService
    └── routes/                # auth, news, users, uploads, admin, categories, tags, settings, favorites
```

### Frontend (`notipoli-react/`)

```
notipoli-react/
├── Dockerfile                 # Multi-stage: builder (Vite) → runner (Nginx)
├── .dockerignore
├── .env.example
├── nginx.conf                 # SPA fallback, proxy /api, cache, security headers
├── vite.config.js             # Proxy dev /api → localhost:3000
├── package.json               # React 19, Vite, Tailwind 4, Bootstrap 5, React Router 7
└── src/
    ├── components/            # Header, Footer, HeroSection, NewsCard
    ├── pages/                 # Home, NewsList, NewsDetail, Login, Admin, Contact
    ├── context/               # React Context (auth, theme, etc.)
    ├── App.jsx                # Routing principal
    └── main.jsx               # Entry point
```

---

## Modelo de Datos (Prisma)

### Entidades Principales

- **User** - Usuarios con roles (ADMIN, EDITOR, VIEWER)
- **News** - Noticias con slug, status (DRAFT/PUBLISHED/ARCHIVED), cover image
- **Category** - Categorías con color hex para UI
- **Tag** - Etiquetas simples
- **Upload** - Archivos subidos con metadata
- **Setting** - Configuración clave-valor del sitio
- **RefreshToken** - Tokens de renovación JWT (revocables)

### Relaciones

- User 1:N News (author)
- News N:M Category (via NewsCategory)
- News N:M Tag (via NewsTag)
- User 1:N RefreshToken
- User 1:N Upload (uploadedBy)

---

## Despliegue en Producción

### Checklist Pre-despliegue

- [ ] Cambiar todas las contraseñas en `.env`
- [ ] Generar `JWT_SECRET` y `JWT_REFRESH_SECRET` únicos de 64+ chars
- [ ] Configurar `FRONTEND_URL` con dominio real (HTTPS)
- [ ] Configurar SSL/TLS en nginx (certificados Let's Encrypt o Cloudflare)
- [ ] Configurar backups automáticos (cron + pg_dump + uploads sync)
- [ ] Configurar logging/monitoring (Loki, Prometheus, Grafana)
- [ ] Configurar health checks en load balancer

### Docker Compose Produccción

```bash
# En servidor
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Variables Críticas en Producción

```env
NODE_ENV=production
JWT_SECRET=<64+ chars aleatorios>
JWT_REFRESH_SECRET=<64+ chars aleatorios, diferente al anterior>
DB_PASSWORD=<32+ chars aleatorios>
FRONTEND_URL=https://tu-dominio.com
LOG_LEVEL=warn
```

---

## Tecnologías

### Backend
- **Fastify 5** - Framework web rápido, tipado
- **Prisma 5** - ORM type-safe con migraciones
- **PostgreSQL 16** - Base de datos relacional robusta
- **Zod** - Validación de esquemas
- **JWT** - Autenticación stateless (access + refresh tokens)
- **Swagger/OpenAPI** - Documentación automática
- **pino** - Logging estructurado

### Frontend
- **React 19** - UI library
- **Vite 8** - Build tool ultra-rápido
- **Tailwind CSS 4** - Utility-first CSS
- **Bootstrap 5** - Componentes UI
- **React Router 7** - SPA routing
- **Oxlint** - Linter rápido

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación local
- **Nginx** - Reverse proxy + static serving
- **Multi-stage builds** - Imágenes optimizadas

---

## Licencia

Proyecto privado - Todos los derechos reservados.