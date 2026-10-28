// notipoli-node/src/index.ts
import Fastify from 'fastify'
import { config, isDev } from './config/index.js'
import prisma from './config/prisma.js'
import { registerPlugins } from './plugins/index.js'
import { registerRoutes } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
    },
  })

  // Global error handler
  app.setErrorHandler(errorHandler)

  // Register plugins (cors, helmet, jwt, swagger, multipart, rate-limit)
  await registerPlugins(app)

  // Register routes
  await registerRoutes(app)

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // Start server
  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' })
    app.log.info(`🚀 Server running on http://0.0.0.0:${config.PORT}`)
    app.log.info(`📚 Swagger UI: http://0.0.0.0:${config.PORT}/docs`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down gracefully...`)
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

bootstrap()