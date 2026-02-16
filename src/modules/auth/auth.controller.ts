import { FastifyReply, FastifyRequest } from 'fastify'
import { loginSchema, refreshTokenSchema } from './auth.schema'
import { authService } from './auth.service'

export const authController = {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const data = loginSchema.parse(request.body)
    const result = await authService.login(data)
    return reply.status(200).send(result)
  },

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const data = refreshTokenSchema.parse(request.body)
    const result = await authService.refresh(data)
    return reply.status(200).send(result)
  },

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user.sub
    await authService.logout(userId)
    return reply.status(204).send()
  },
}