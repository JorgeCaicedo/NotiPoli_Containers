// notipoli-node/src/routes/settings.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../config/prisma.js'
import { requireRole } from '../middleware/auth.js'

const updateSettingSchema = z.object({
  params: z.object({ key: z.string() }),
  body: z.object({
    value: z.string(),
    description: z.string().optional(),
  }),
})

const keyParamSchema = z.object({
  params: z.object({ key: z.string() }),
})

export async function settingRoutes(app: FastifyInstance) {
  // GET /api/settings - List all (public)
  app.get('/', async (request, reply) => {
    const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } })
    return reply.send({ data: settings })
  })

  // GET /api/settings/:key - Get one (public)
  app.get('/:key', { schema: keyParamSchema }, async (request, reply) => {
    const { key } = request.params as any
    const setting = await prisma.setting.findUnique({ where: { key } })
    if (!setting) return reply.status(404).send({ message: 'Setting not found' })
    return reply.send({ data: setting })
  })

  // PUT /api/settings/:key - Update (admin)
  app.put('/:key', { schema: updateSettingSchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const { key } = request.params as any
    const { value, description } = request.body as any

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    })

    return reply.send({ data: setting })
  })

  // DELETE /api/settings/:key - Delete (admin)
  app.delete('/:key', { schema: keyParamSchema, preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const { key } = request.params as any
    await prisma.setting.delete({ where: { key } })
    return reply.send({ message: 'Setting deleted' })
  })
}