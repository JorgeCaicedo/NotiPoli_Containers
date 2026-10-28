// notipoli-node/src/routes/categories.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import prisma from '../config/prisma.js'
import { requireRole } from '../middleware/auth.js'

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    description: z.string().max(500).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
})

const updateCategorySchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().max(500).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
})

const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
})

export async function categoryRoutes(app: FastifyInstance) {
  // GET /api/categories - List all (public)
  app.get('/', async (request, reply) => {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { news: true } } },
      orderBy: { name: 'asc' },
    })
    return reply.send({ data: categories })
  })

  // GET /api/categories/:id - Get one (public)
  app.get('/:id', { schema: idParamSchema }, async (request, reply) => {
    const { id } = request.params as any
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { news: true } } },
    })
    if (!category) return reply.status(404).send({ message: 'Category not found' })
    return reply.send({ data: category })
  })

  // POST /api/categories - Create (admin)
  app.post('/', { schema: createCategorySchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const category = await prisma.category.create({ data: request.body as any })
    return reply.status(201).send({ data: category })
  })

  // PUT /api/categories/:id - Update (admin)
  app.put('/:id', { schema: updateCategorySchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const { id } = request.params as any
    const category = await prisma.category.update({ where: { id }, data: request.body as any })
    return reply.send({ data: category })
  })

  // DELETE /api/categories/:id - Delete (admin)
  app.delete('/:id', { schema: idParamSchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const { id } = request.params as any
    await prisma.category.delete({ where: { id } })
    return reply.send({ message: 'Category deleted' })
  })
}