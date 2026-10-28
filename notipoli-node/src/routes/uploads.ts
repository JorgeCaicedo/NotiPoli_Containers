// notipoli-node/src/routes/uploads.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { join, extname } from 'path'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import prisma from '../config/prisma.js'
import { config } from '../config/index.js'
import { requireRole, AuthUser } from '../middleware/auth.js'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_FILE_SIZE = config.MAX_FILE_SIZE

export async function uploadRoutes(app: FastifyInstance) {
  // POST /api/uploads - Upload single file (admin/editor)
  app.post('/', { preHandler: [requireRole('ADMIN', 'EDITOR')] }, async (request, reply) => {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ message: 'No file uploaded' })
    }

    if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
      return reply.status(400).send({ message: 'File type not allowed' })
    }

    const chunks: Buffer[] = []
    for await (const chunk of data.file) {
      chunks.push(chunk)
      if (Buffer.concat(chunks).length > MAX_FILE_SIZE) {
        return reply.status(413).send({ message: 'File size exceeds limit' })
      }
    }

    const buffer = Buffer.concat(chunks)
    const ext = extname(data.filename).toLowerCase()
    const filename = `${randomUUID()}${ext}`
    const relativePath = join('uploads', filename)
    const absolutePath = join(config.UPLOAD_DIR, filename)

    if (!existsSync(config.UPLOAD_DIR)) {
      await mkdir(config.UPLOAD_DIR, { recursive: true })
    }

    await writeFile(absolutePath, buffer)

    const userData = request.authUser as AuthUser | undefined
    const upload = await prisma.upload.create({
      data: {
        filename,
        originalName: data.filename,
        mimeType: data.mimetype,
        size: buffer.length,
        path: relativePath,
        url: `/api/uploads/${filename}`,
        uploadedBy: userData?.id,
      },
    })

    return reply.status(201).send({ data: upload })
  })

  // GET /api/uploads/:filename - Serve file
  app.get('/:filename', async (request, reply) => {
    const { filename } = request.params as any
    const filePath = join(config.UPLOAD_DIR, filename)

    if (!existsSync(filePath)) {
      return reply.status(404).send({ message: 'File not found' })
    }

    const upload = await prisma.upload.findUnique({ where: { filename } })
    if (!upload) {
      return reply.status(404).send({ message: 'File not found' })
    }

    const fileBuffer = await readFile(filePath)
    return reply
      .header('Content-Type', upload.mimeType)
      .header('Content-Disposition', `inline; filename="${upload.originalName}"`)
      .send(fileBuffer)
  })

  // GET /api/uploads - List uploads (admin only)
  app.get('/', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const uploads = await prisma.upload.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return reply.send({ data: uploads })
  })

  // DELETE /api/uploads/:id - Delete upload (admin only)
  app.delete('/:id', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const { id } = request.params as any

    const upload = await prisma.upload.findUnique({ where: { id } })
    if (!upload) {
      return reply.status(404).send({ message: 'Upload not found' })
    }

    const filePath = join(config.UPLOAD_DIR, upload.filename)
    if (existsSync(filePath)) {
      const { unlink } = await import('fs/promises')
      await unlink(filePath).catch(() => {})
    }

    await prisma.upload.delete({ where: { id } })

    return reply.send({ message: 'Upload deleted successfully' })
  })
}