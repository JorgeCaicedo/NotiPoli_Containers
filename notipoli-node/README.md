# NotiPoli Node - Backend API

API REST para la plataforma NotiPoli.

## Estado

🚧 **En desarrollo** - Estructura base creada, pendiente de implementación.

## Tecnologías planeadas

- **Node.js** (v18+)
- **Express** o **Fastify** - Framework web
- **TypeScript** - Tipado estático
- **Base de datos** - PostgreSQL (con Prisma/TypeORM) o MongoDB (con Mongoose)
- **Autenticación** - JWT + Refresh tokens
- **Validación** - Zod
- **Testing** - Vitest / Jest
- **Documentación API** - Swagger/OpenAPI

## Estructura de carpetas (planeada)

```
notipoli-node/
├── src/
│   ├── config/         # Configuración centralizada (env, DB, etc.)
│   ├── controllers/    # Controladores HTTP
│   ├── middleware/     # Middlewares (auth, error handling, validation)
│   ├── models/         # Modelos de datos / esquemas
│   ├── routes/         # Definición de rutas API
│   ├── services/       # Lógica de negocio / casos de uso
│   ├── utils/          # Helpers y utilidades
│   └── index.ts        # Punto de entrada (bootstrap)
├── prisma/             # Schema de BD (si se usa Prisma)
├── tests/              # Tests unitarios e integración
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Endpoints planeados

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Cerrar sesión

### Noticias
- `GET /api/news` - Listar noticias (paginado, filtros)
- `GET /api/news/:id` - Detalle de noticia
- `POST /api/news` - Crear noticia (admin)
- `PUT /api/news/:id` - Actualizar noticia (admin)
- `DELETE /api/news/:id` - Eliminar noticia (admin)

### Usuarios
- `GET /api/users/me` - Perfil usuario actual
- `PUT /api/users/me` - Actualizar perfil
- `GET /api/users/:id` - Perfil público

### Admin
- `GET /api/admin/stats` - Estadísticas del panel
- `GET /api/admin/users` - Gestión de usuarios

## Scripts (planeados)

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm run start        # Producción
npm run test         # Tests
npm run test:watch   # Tests en watch mode
npm run lint         # ESLint
npm run db:migrate   # Migraciones BD
npm run db:seed      # Seed datos iniciales
npm run db:studio    # Prisma Studio (si aplica)
```

## Variables de entorno

Ver `.env.example` para la lista completa.

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=http://localhost:5173
```

## Instalación (cuando esté listo)

```bash
cd notipoli-node
npm install
cp .env.example .env
# Configurar .env
npm run db:migrate
npm run dev
```

## Despliegue

- **Desarrollo**: `npm run dev`
- **Producción**: `npm run build && npm run start`
- **Docker**: Dockerfile incluido (por crear)
- **CI/CD**: GitHub Actions (por configurar)