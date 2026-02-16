import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { env } from '../../core/config/env'
import { UnauthorizedError } from '../../core/errors/index'
import { TokenPayload } from '../../modules/auth/auth.schema'

declare module 'fastify' {
  interface FastifyRequest {
    user: TokenPayload
  }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError()
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload
    request.user = payload
  } catch {
    throw new UnauthorizedError('Token expired or invalid')
  }
}