import { FastifyInstance } from 'fastify'
import { authenticate } from '../../shared/middlewares/auth'
import { userController } from './user.controller'

export const userRoutes = async (app: FastifyInstance) => {
  app.post('/register', userController.register)

  app.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: authenticate },
    userController.findById,
  )
}