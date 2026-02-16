import { FastifyReply, FastifyRequest } from 'fastify'
import { createGameSchema, listGamesSchema, updateGameSchema } from './game.schema'
import { gameService } from './game.service'

type GameParams = { Params: { id: string } }
type GameSlugParams = { Params: { slug: string } }
type ListGamesQuery = { Querystring: { page?: string, limit?: string, search?: string, tag?: string, status?: string } }

export const gameController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createGameSchema.parse(request.body)
    const developerId = request.user.sub
    const game = await gameService.create(developerId, data)
    return reply.status(201).send(game)
  },

  async findById(request: FastifyRequest<GameParams>, reply: FastifyReply) {
    const game = await gameService.findById(request.params.id)
    return reply.status(200).send(game)
  },

  async findBySlug(request: FastifyRequest<GameSlugParams>, reply: FastifyReply) {
    const game = await gameService.findBySlug(request.params.slug)
    return reply.status(200).send(game)
  },

  async list(request: FastifyRequest<ListGamesQuery>, reply: FastifyReply) {
    const filters = listGamesSchema.parse(request.query)
    const result = await gameService.list(filters)
    return reply.status(200).send(result)
  },

  async update(request: FastifyRequest<GameParams>, reply: FastifyReply) {
    const data = updateGameSchema.parse(request.body)
    const game = await gameService.update(request.params.id, request.user.sub, data)
    return reply.status(200).send(game)
  },

  async publish(request: FastifyRequest<GameParams>, reply: FastifyReply) {
    const game = await gameService.publish(request.params.id, request.user.sub)
    return reply.status(200).send(game)
  },

  async archive(request: FastifyRequest<GameParams>, reply: FastifyReply) {
    const game = await gameService.archive(request.params.id, request.user.sub)
    return reply.status(200).send(game)
  },

  async delete(request: FastifyRequest<GameParams>, reply: FastifyReply) {
    await gameService.delete(request.params.id, request.user.sub)
    return reply.status(204).send()
  },
}