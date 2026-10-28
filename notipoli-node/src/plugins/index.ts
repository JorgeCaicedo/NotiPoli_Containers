// notipoli-node/src/plugins/index.ts
import { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { config } from '../config/index.js'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function registerPlugins(app: FastifyInstance) {
  // CORS
  await app.register(cors, {
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disable for API
  })

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
  })

  // JWT plugin (single registration)
  await app.register(jwt, {
    secret: config.JWT_SECRET,
    sign: { expiresIn: config.JWT_EXPIRES_IN },
    verify: { maxAge: config.JWT_EXPIRES_IN },
  })

  // Multipart (file uploads)
  await app.register(multipart, {
    limits: {
      fileSize: config.MAX_FILE_SIZE,
      files: 5,
    },
  })

  // Swagger/OpenAPI
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'NotiPoli API',
        description: 'API documentation for NotiPoli platform',
        version: '1.0.0',
      },
      servers: [
        { url: `http://localhost:${config.PORT}`, description: 'Development server' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  })

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  })

  // Zod type provider for validation
  app.withTypeProvider<ZodTypeProvider>()
}