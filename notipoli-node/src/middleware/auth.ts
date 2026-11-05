// notipoli-node/src/middleware/auth.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { config } from '../config/index.js'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: AuthUser
  }
}

export async function authenticate(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    const publicPaths = ['/health', '/docs', '/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/news', '/api/categories', '/api/tags']
    if (publicPaths.some(path => request.url.startsWith(path))) return

    try {
      const token = request.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return reply.status(401).send({ message: 'No token provided' })
      }

      const decoded = await request.jwtVerify<AuthUser>()
      request.authUser = decoded
    } catch {
      return reply.status(401).send({ message: 'Invalid token' })
    }
  })
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.authUser as AuthUser | undefined
    if (!user) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
    if (!roles.includes(user.role)) {
      return reply.status(403).send({ message: 'Forbidden: insufficient permissions' })
    }
  }
}

export async function optionalAuth(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) return

    try {
      const decoded = await request.jwtVerify<AuthUser>()
      request.authUser = decoded
    } catch {
      // Ignore invalid token for optional auth
    }
  })
}