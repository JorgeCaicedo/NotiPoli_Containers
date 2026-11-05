// notipoli-node/src/routes/tags.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../config/prisma.js'
import { requireRole } from '../middleware/auth.js'

const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(30),
    slug: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/),
  }),
})

const updateTagSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(2).max(30).optional(),
    slug: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/).optional(),
  }),
})

const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
})

export async function tagRoutes(app: FastifyInstance) {
  // GET /api/tags - List all (public)
  app.get('/', async (request, reply) => {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { News: true } } },
      orderBy: { name: 'asc' },
    })
    return reply.send({ data: tags })
  })

  // GET /api/tags/:id - Get one (public)
  app.get('/:id', { schema: idParamSchema }, async (request, reply) => {
    const { id } = request.params as any
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { News: true } } },
    })
    if (!tag) return reply.status(404).send({ message: 'Tag not found' })
    return reply.send({ data: tag })
  })

  // POST /api/tags - Create (admin)
  app.post('/', { schema: createTagSchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const tag = await prisma.tag.create({ data: request.body as any })
    return reply.status(201).send({ data: tag })
  })

  // PUT /api/tags/:id - Update (admin)
  app.put('/:id', { schema: updateTagSchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const { id } = request.params as any
    const tag = await prisma.tag.update({ where: { id }, data: request.body as any })
    return reply.send({ data: tag })
  })

  // DELETE /api/tags/:id - Delete (admin)
  app.delete('/:id', { schema: idParamSchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const { id } = request.params as any
    await prisma.tag.delete({ where: { id } })
    return reply.send({ message: 'Tag deleted' })
  })
}