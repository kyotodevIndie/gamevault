import { FastifyInstance } from 'fastify'
import { authenticate } from '../../shared/middlewares/auth'
import { gameController } from './game.controller'

type IdParam = { Params: { id: string } }
type SlugParam = { Params: { slug: string } }

export const gameRoutes = async (app: FastifyInstance) => {
  // Rotas públicas
  app.get('/', gameController.list)
  app.get<SlugParam>('/slug/:slug', gameController.findBySlug)
  app.get<IdParam>('/:id', gameController.findById)

  // Rotas privadas
  app.post('/', { preHandler: authenticate }, gameController.create)
  app.patch<IdParam>('/:id', { preHandler: authenticate }, gameController.update)
  app.patch<IdParam>('/:id/publish', { preHandler: authenticate }, gameController.publish)
  app.patch<IdParam>('/:id/archive', { preHandler: authenticate }, gameController.archive)
  app.delete<IdParam>('/:id', { preHandler: authenticate }, gameController.delete)
}