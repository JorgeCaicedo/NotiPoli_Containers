// notipoli-node/src/routes/news.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import prisma from '../config/prisma.js'
import { requireRole, AuthUser } from '../middleware/auth.js'

const createNewsSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    excerpt: z.string().max(500).optional(),
    content: z.string().min(10),
    coverImage: z.string().url().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    categoryIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
  }),
})

const updateNewsSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    excerpt: z.string().max(500).optional(),
    content: z.string().min(10).optional(),
    coverImage: z.string().url().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    categoryIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
  }),
})

const newsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(50).default(10),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    categoryId: z.string().optional(),
    tagId: z.string().optional(),
    authorId: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['createdAt', 'publishedAt', 'title']).default('publishedAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
})

const slugParamSchema = z.object({
  params: z.object({ slug: z.string() }),
})

const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
})

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36)
}

export async function newsRoutes(app: FastifyInstance) {
  // GET /api/news - List news (public: only published)
  app.get('/', {
    preHandler: async (request, reply) => {
      // Public route - but still attach user if authenticated
      const token = request.headers.authorization?.replace('Bearer ', '')
      if (token) {
        try {
          const decoded = await request.jwtVerify<AuthUser>()
          request.authUser = decoded
        } catch {
          // Ignore - user not authenticated, still allow access
        }
      }
    },
  }, async (request, reply) => {
    // Parse and validate query params with defaults
    const query = request.query as any

    const page = typeof query.page === 'string' ? parseInt(query.page, 10) : 1
    const limit = typeof query.limit === 'string' ? parseInt(query.limit, 10) : 10
    const status = query.status
    const categoryId = query.categoryId
    const tagId = query.tagId
    const authorId = query.authorId
    const search = query.search
    const sort = query.sort || 'publishedAt'
    const order = query.order || 'desc'

    const where: any = {}

    const user = request.authUser as AuthUser | undefined
    const isAdminOrEditor = user?.role === 'ADMIN' || user?.role === 'EDITOR'
    if (!isAdminOrEditor) {
      where.status = 'PUBLISHED'
      where.publishedAt = { lte: new Date() }
    } else if (query.status) {
      where.status = query.status
    }

    if (categoryId) where.categories = { some: { categoryId } }
    if (tagId) where.tags = { some: { tagId } }
    if (authorId) where.authorId = authorId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          categories: true,
          tags: true,
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.news.count({ where }),
    ])

    return reply.send({
      data: news,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  })

  // GET /api/news/slug/:slug - Get by slug (public)
  app.get('/slug/:slug', { schema: slugParamSchema }, async (request, reply) => {
    const { slug } = request.params as any

    const user = request.authUser as AuthUser | undefined
    const isAdminOrEditor = user?.role === 'ADMIN' || user?.role === 'EDITOR'

    const news = await prisma.news.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        categories: true,
        tags: true,
      },
    })

    if (!news) {
      return reply.status(404).send({ message: 'News not found' })
    }

    if (!isAdminOrEditor && (news.status !== 'PUBLISHED' || (news.publishedAt && news.publishedAt > new Date()))) {
      return reply.status(404).send({ message: 'News not found' })
    }

    return reply.send({ data: news })
  })

  // GET /api/news/:id - Get by ID (admin/editor can see all, viewer/editor see published only)
  app.get('/:id', { schema: idParamSchema }, async (request, reply) => {
    const { id } = request.params as any

    const user = request.authUser as AuthUser | undefined
    const isAdminOrEditor = user?.role === 'ADMIN' || user?.role === 'EDITOR'

    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        categories: true,
        tags: true,
      },
    })

    if (!news) {
      return reply.status(404).send({ message: 'News not found' })
    }

    // Check if news is accessible for non-admin/editor users
    if (!isAdminOrEditor) {
      if (news.status !== 'PUBLISHED' || (news.publishedAt && news.publishedAt > new Date())) {
        return reply.status(404).send({ message: 'News not found' })
      }
    }

    return reply.send({ data: news })
  })

  // POST /api/news - Create news (admin/editor)
  app.post('/', {
    schema: createNewsSchema,
    preHandler: [
      async (request, reply) => {
        const token = request.headers.authorization?.replace('Bearer ', '')
        if (!token) return reply.status(401).send({ message: 'Unauthorized' })
        try {
          const decoded = await request.jwtVerify<AuthUser>()
          request.authUser = decoded
        } catch {
          return reply.status(401).send({ message: 'Invalid token' })
        }
      },
      requireRole('ADMIN', 'EDITOR'),
    ],
  }, async (request, reply) => {
    const { title, excerpt, content, coverImage, status, categoryIds, tagIds } = request.body as any
    const user = request.authUser as AuthUser

    const slug = generateSlug(title)

    const newsData: any = {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      authorId: user.id,
    }

    if (categoryIds && categoryIds.length > 0) {
      newsData.categories = {
        connect: categoryIds.map((id: string) => ({ id })),
      }
    }
    if (tagIds && tagIds.length > 0) {
      newsData.tags = {
        connect: tagIds.map((id: string) => ({ id })),
      }
    }

    const news = await prisma.news.create({
      data: newsData,
      include: {
        author: { select: { id: true, name: true } },
        categories: true,
        tags: true,
      },
    })

    return reply.status(201).send({ data: news })
  })

  // PUT /api/news/:id - Update news (admin/editor)
  app.put('/:id', {
    schema: updateNewsSchema,
    preHandler: [
      async (request, reply) => {
        const token = request.headers.authorization?.replace('Bearer ', '')
        if (!token) return reply.status(401).send({ message: 'Unauthorized' })
        try {
          const decoded = await request.jwtVerify<AuthUser>()
          request.authUser = decoded
        } catch {
          return reply.status(401).send({ message: 'Invalid token' })
        }
      },
      requireRole('ADMIN', 'EDITOR'),
    ],
  }, async (request, reply) => {
    const { id } = request.params as any
    const { title, excerpt, content, coverImage, status, categoryIds, tagIds } = request.body as any

    const existing = await prisma.news.findUnique({ where: { id } })
    if (!existing) {
      return reply.status(404).send({ message: 'News not found' })
    }

    const data: any = {}
    if (title !== undefined) data.title = title
    if (excerpt !== undefined) data.excerpt = excerpt
    if (content !== undefined) data.content = content
    if (coverImage !== undefined) data.coverImage = coverImage
    if (status !== undefined) {
      data.status = status
      if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
        data.publishedAt = new Date()
      }
    }

    const updateData: any = { ...data }
    if (categoryIds) {
      updateData.categories = {
        set: categoryIds.map((id: string) => ({ id })),
      }
    }
    if (tagIds) {
      updateData.tags = {
        set: tagIds.map((id: string) => ({ id })),
      }
    }

    const news = await prisma.news.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true } },
        categories: true,
        tags: true,
      },
    })

    return reply.send({ data: news })
  })

  // DELETE /api/news/:id - Delete news (admin only)
  app.delete('/:id', {
    schema: idParamSchema,
    preHandler: [
      async (request, reply) => {
        const token = request.headers.authorization?.replace('Bearer ', '')
        if (!token) return reply.status(401).send({ message: 'Unauthorized' })
        try {
          const decoded = await request.jwtVerify<AuthUser>()
          request.authUser = decoded
        } catch {
          return reply.status(401).send({ message: 'Invalid token' })
        }
      },
      requireRole('ADMIN'),
    ],
  }, async (request, reply) => {
    const { id } = request.params as any

    const existing = await prisma.news.findUnique({ where: { id } })
    if (!existing) {
      return reply.status(404).send({ message: 'News not found' })
    }

    await prisma.news.delete({ where: { id } })

    return reply.send({ message: 'News deleted successfully' })
  })
}