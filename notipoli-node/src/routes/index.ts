// notipoli-node/src/routes/index.ts
import { FastifyInstance } from 'fastify'
import { authRoutes } from './auth.js'
import { newsRoutes } from './news.js'
import { userRoutes } from './users.js'
import { uploadRoutes } from './uploads.js'
import { adminRoutes } from './admin.js'
import { categoryRoutes } from './categories.js'
import { tagRoutes } from './tags.js'
import { settingRoutes } from './settings.js'
import { favoriteRoutes } from './favorites.js'

export async function registerRoutes(app: FastifyInstance) {
  // Register all route modules
  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(newsRoutes, { prefix: '/api/news' })
  await app.register(userRoutes, { prefix: '/api/users' })
  await app.register(uploadRoutes, { prefix: '/api/uploads' })
  await app.register(adminRoutes, { prefix: '/api/admin' })
  await app.register(categoryRoutes, { prefix: '/api/categories' })
  await app.register(tagRoutes, { prefix: '/api/tags' })
  await app.register(settingRoutes, { prefix: '/api/settings' })
  await app.register(favoriteRoutes, { prefix: '/api/favorites' })
}