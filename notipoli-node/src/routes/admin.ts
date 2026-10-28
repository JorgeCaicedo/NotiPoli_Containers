// notipoli-node/src/routes/admin.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../config/prisma.js'
import { requireRole } from '../middleware/auth.js'

interface NewsStatusCount {
  status: string
  _count: number
}

interface UserRoleCount {
  role: string
  _count: number
}

interface UploadsByMonth {
  month: string
  count: bigint
}

export async function adminRoutes(app: FastifyInstance) {
  // GET /api/admin/stats - Dashboard stats (admin only)
  app.get('/stats', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const [
      totalUsers,
      totalNews,
      publishedNews,
      draftNews,
      totalUploads,
      recentUsers,
      recentNews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.news.count(),
      prisma.news.count({ where: { status: 'PUBLISHED' } }),
      prisma.news.count({ where: { status: 'DRAFT' } }),
      prisma.upload.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.news.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } },
      }),
    ])

    const newsByStatus = await prisma.news.groupBy({
      by: ['status'],
      _count: true,
    })

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    })

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const uploadsByMonth = await prisma.$queryRaw`
      SELECT to_char("createdAt", 'YYYY-MM') as month, count(*) as count
      FROM "uploads"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY month
      ORDER BY month
    ` as UploadsByMonth[]

    return reply.send({
      data: {
        overview: {
          totalUsers,
          totalNews,
          publishedNews,
          draftNews,
          totalUploads,
        },
        newsByStatus: newsByStatus.map((s: NewsStatusCount) => ({ status: s.status, count: s._count })),
        usersByRole: usersByRole.map((r: UserRoleCount) => ({ role: r.role, count: r._count })),
        uploadsByMonth: uploadsByMonth.map((m: UploadsByMonth) => ({ month: m.month, count: Number(m.count) })),
        recentUsers,
        recentNews,
      },
    })
  })

  // GET /api/admin/users - All users with pagination (admin only)
  app.get('/users', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const page = Number((request.query as any).page) || 1
    const limit = Math.min(Number((request.query as any).limit) || 20, 100)
    const search = (request.query as any).search
    const role = (request.query as any).role

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (role) where.role = role

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, avatarUrl: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return reply.send({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  })
}