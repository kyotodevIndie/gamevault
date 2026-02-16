import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from '../../core/errors/index'
import { logger } from '../../core/logger/index'

export const errorHandler = (
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // Erro de validação do Zod
  if (error instanceof ZodError) {
    return reply.status(422).send({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      details: error.flatten().fieldErrors,
    })
  }

  // Erro da nossa aplicação
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: 'error',
      code: error.code,
      message: error.message,
      details: error.details,
    })
  }

  // Erro inesperado — loga e retorna 500
  logger.error({ err: error, req: request.id }, 'Unexpected error')

  return reply.status(500).send({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  })
}