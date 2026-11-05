// notipoli-node/src/routes/favorites.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import prisma from '../config/prisma.js'
import { getUserFavorites, addFavorite, removeFavorite, isFavorite } from '../services/favoriteService.js'

const toggleSchema = z.object({
  body: z.object({
    newsId: z.string().cuid(),
  }),
})

export async function favoriteRoutes(app: FastifyInstance) {
  // GET /api/favorites - Listar favoritos del usuario
  app.get('/', {
    preHandler: async (request, reply) => {
      if (!request.authUser) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.authUser) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const favorites = await getUserFavorites(request.authUser.id)
    return reply.send({ favorites })
  })

  // POST /api/favorites - Agregar a favoritos
  app.post('/', { schema: toggleSchema }, async (request: FastifyRequest<{ Body: { newsId: string } }>, reply: FastifyReply) => {
    if (!request.authUser) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { newsId } = request.body

    const existing = await prisma.news.findUnique({
      where: { id: newsId },
      select: { status: true, publishedAt: true },
    })

    if (!existing) {
      return reply.status(404).send({ message: 'News not found' })
    }

    if (existing.status !== 'PUBLISHED' || !existing.publishedAt || existing.publishedAt > new Date()) {
      return reply.status(400).send({ message: 'Can only favorite published news' })
    }

    const favorite = await addFavorite(request.authUser.id, newsId)
    return reply.send({ favorite, isFavorite: true })
  })

  // DELETE /api/favorites/:newsId - Quitar de favoritos
  app.delete('/:newsId', {
    schema: z.object({
      params: z.object({
        newsId: z.string().cuid(),
      }),
    }),
  }, async (request: FastifyRequest<{ Params: { newsId: string } }>, reply: FastifyReply) => {
    if (!request.authUser) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { newsId } = request.params

    const existing = await isFavorite(request.authUser.id, newsId)
    if (!existing) {
      return reply.status(404).send({ message: 'Favorite not found' })
    }

    await removeFavorite(request.authUser.id, newsId)
    return reply.send({ isFavorite: false })
  })

  // GET /api/favorites/:newsId - Verificar si es favorito
  app.get('/:newsId', {
    schema: z.object({
      params: z.object({
        newsId: z.string().cuid(),
      }),
    }),
  }, async (request: FastifyRequest<{ Params: { newsId: string } }>, reply: FastifyReply) => {
    if (!request.authUser) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { newsId } = request.params
    const favorite = await isFavorite(request.authUser.id, newsId)
    return reply.send({ isFavorite: !!favorite })
  })
}