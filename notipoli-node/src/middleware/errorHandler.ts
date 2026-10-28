// notipoli-node/src/middleware/errorHandler.ts
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { config } from '../config/index.js'

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Validation errors (Zod)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: error.flatten().fieldErrors,
    })
  }

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[])?.join(', ') || 'field'
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: `A record with this ${target} already exists`,
      })
    }

    // Foreign key constraint
    if (error.code === 'P2003') {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Referenced record does not exist',
      })
    }

    // Record not found
    if (error.code === 'P2025') {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Record not found',
      })
    }
  }

  // JWT errors
  if (error.code === 'FST_JWT_AUTH_ERROR' || error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or missing token',
    })
  }

  // Rate limit
  if (error.code === 'FST_RATE_LIMIT_EXCEEDED') {
    return reply.status(429).send({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded, please try again later',
    })
  }

  // File upload errors
  if (error.code === 'FST_MULTIPART_FILE_TOO_LARGE') {
    return reply.status(413).send({
      statusCode: 413,
      error: 'Payload Too Large',
      message: 'File size exceeds limit',
    })
  }

  // Log unexpected errors
  request.log.error({ err: error }, 'Unhandled error')

  // Generic error response
  const statusCode = error.statusCode || 500
  const message = config.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : error.message

  return reply.status(statusCode).send({
    statusCode,
    error: error.name || 'Error',
    message,
  })
}