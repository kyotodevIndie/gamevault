import { FastifyInstance } from 'fastify'
import { authenticate } from '../../shared/middlewares/auth'
import { authController } from './auth.controller'

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/login', authController.login)
  app.post('/refresh', authController.refresh)
  app.post('/logout', { preHandler: authenticate }, authController.logout)
}