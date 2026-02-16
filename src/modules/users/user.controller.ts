import { FastifyReply, FastifyRequest } from 'fastify'
import { createUserSchema } from './user.schema'
import { userService } from './user.service'

type FindByIdParams = { Params: { id: string } }

export const userController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const data = createUserSchema.parse(request.body)
    const user = await userService.register(data)
    return reply.status(201).send(user)
  },

  async findById(request: FastifyRequest<FindByIdParams>, reply: FastifyReply) {
    const { id } = request.params
    const user = await userService.findById(id)
    return reply.status(200).send(user)
  },
}