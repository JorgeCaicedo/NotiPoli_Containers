// notipoli-node/src/routes/auth.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '../config/prisma.js'
import crypto from 'crypto'
import { getRoleMenus } from '../services/roleMenuService.js'
import { AuthUser } from '../middleware/auth.js'

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
})

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2).max(100),
  }),
})

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
})

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/login
  app.post('/login', { schema: loginSchema }, async (request: FastifyRequest<{ Body: z.infer<typeof loginSchema>['body'] }>, reply: FastifyReply) => {
    const { email, password } = request.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      return reply.status(401).send({ message: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return reply.status(401).send({ message: 'Invalid credentials' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const accessToken = app.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Refresh token stored in database, generated as random string
    const refreshToken = crypto.randomUUID() + crypto.randomUUID()

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return reply.send({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    })
  })

  // POST /api/auth/register
  app.post('/register', { schema: registerSchema }, async (request: FastifyRequest<{ Body: z.infer<typeof registerSchema>['body'] }>, reply: FastifyReply) => {
    const { email, password, name } = request.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return reply.status(409).send({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash, name, role: 'VIEWER' },
    })

    const accessToken = app.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Refresh token stored in database
    const refreshToken = crypto.randomUUID() + crypto.randomUUID()

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return reply.status(201).send({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    })
  })

  // POST /api/auth/refresh
  app.post('/refresh', { schema: refreshSchema }, async (request: FastifyRequest<{ Body: z.infer<typeof refreshSchema>['body'] }>, reply: FastifyReply) => {
    const { refreshToken } = request.body

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return reply.status(401).send({ message: 'Invalid refresh token' })
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } })
    if (!user || !user.isActive) {
      return reply.status(401).send({ message: 'User not found or inactive' })
    }

    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    })

    const newAccessToken = app.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    const newRefreshToken = crypto.randomUUID() + crypto.randomUUID()

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return reply.send({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  })

  // POST /api/auth/logout
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      try {
        const decoded = await request.jwtVerify<{ id: string }>()
        await prisma.refreshToken.updateMany({
          where: { userId: decoded.id, revokedAt: null },
          data: { revokedAt: new Date() },
        })
      } catch {
        // Ignore
      }
    }
    return reply.send({ message: 'Logged out' })
  })

  // GET /api/auth/me
  app.get('/me', {
    preHandler: async (request, reply) => {
      if (!request.authUser) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.authUser!.id },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, createdAt: true },
    })

    if (!user) {
      return reply.status(404).send({ message: 'User not found' })
    }

    return reply.send({ user })
  })

  // GET /api/auth/menus - Get menus based on user role
  // Security: query param role rejected - must use JWT authentication
  app.get('/menus', {
    preHandler: async (request, reply) => {
      const token = request.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return reply.status(401).send({ message: 'Authentication required' })
      }

      try {
        const decoded = await request.jwtVerify<AuthUser>()
        request.authUser = decoded
      } catch {
        return reply.status(401).send({ message: 'Invalid or expired token' })
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Role comes from verified JWT only - query param is ignored for security
      const role = request.authUser!.role

      const menus = await getRoleMenus(role)

      // Add Favorites menu for logged-in users
      const favoritesMenu = {
        menuPath: '/favoritos',
        menuLabel: 'Favoritos',
        menuIcon: 'bi bi-star',
        menuOrder: 99
      }

      // Check if Favoritos already exists for this role, if not add it
      const hasFavorites = menus.some(m => m.menuLabel === 'Favoritos')
      const finalMenus = hasFavorites ? menus : [...menus, favoritesMenu]

      return reply.send({ menus: finalMenus })
    } catch (err) {
      request.log.error({ err: err instanceof Error ? err : new Error(String(err)) }, 'Failed to fetch menus')
      return reply.status(500).send({ message: 'Failed to fetch menus' })
    }
  })
}