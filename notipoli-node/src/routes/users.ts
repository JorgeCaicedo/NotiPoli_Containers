// notipoli-node/src/routes/users.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '../config/prisma.js'
import { requireRole, AuthUser } from '../middleware/auth.js'

const updateUserSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    avatarUrl: z.string().url().optional(),
    role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
    isActive: z.boolean().optional(),
  }),
})

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
  }),
})

const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
})

export async function userRoutes(app: FastifyInstance) {
  // GET /api/users/me - Current user profile
  app.get('/me', async (request, reply) => {
    const userData = request.authUser as AuthUser | undefined
    if (!userData) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userData.id },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, createdAt: true, lastLoginAt: true },
    })

    if (!user) {
      return reply.status(404).send({ message: 'User not found' })
    }

    return reply.send({ data: user })
  })

  // PUT /api/users/me - Update own profile
  app.put('/me', { schema: updateUserSchema }, async (request, reply) => {
    const userData = request.authUser as AuthUser | undefined
    if (!userData) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { name, avatarUrl } = request.body as any

    const user = await prisma.user.update({
      where: { id: userData.id },
      data: { name, avatarUrl },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, createdAt: true },
    })

    return reply.send({ data: user })
  })

  // PUT /api/users/me/password - Change own password
  app.put('/me/password', { schema: changePasswordSchema }, async (request, reply) => {
    const userData = request.authUser as AuthUser | undefined
    if (!userData) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { currentPassword, newPassword } = request.body as any

    const user = await prisma.user.findUnique({ where: { id: userData.id } })
    if (!user) {
      return reply.status(404).send({ message: 'User not found' })
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return reply.status(400).send({ message: 'Current password is incorrect' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userData.id },
      data: { passwordHash },
    })

    await prisma.refreshToken.updateMany({
      where: { userId: userData.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return reply.send({ message: 'Password changed successfully' })
  })

  // GET /api/users/:id - Get public profile
  app.get('/:id', { schema: idParamSchema }, async (request, reply) => {
    const { id } = request.params as any

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, avatarUrl: true, role: true, createdAt: true },
    })

    if (!user) {
      return reply.status(404).send({ message: 'User not found' })
    }

    return reply.send({ data: user })
  })

  // Admin routes
  // GET /api/users - List users (admin only)
  app.get('/', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ data: users })
  })

  // PUT /api/users/:id - Update user (admin only)
  app.put('/:id', { schema: updateUserSchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const { id } = request.params as any
    const { name, avatarUrl, role, isActive } = request.body as any

    const user = await prisma.user.update({
      where: { id },
      data: { name, avatarUrl, role, isActive },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, isActive: true, createdAt: true },
    })

    return reply.send({ data: user })
  })

  // DELETE /api/users/:id - Delete user (admin only)
  app.delete('/:id', { schema: idParamSchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const { id } = request.params as any
    const userData = request.authUser as AuthUser | undefined

    if (userData && id === userData.id) {
      return reply.status(400).send({ message: 'Cannot delete yourself' })
    }

    await prisma.user.delete({ where: { id } })

    return reply.send({ message: 'User deleted successfully' })
  })
}