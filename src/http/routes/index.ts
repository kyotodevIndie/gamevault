import { FastifyInstance } from 'fastify'
import { authRoutes } from '../../modules/auth/auth.routes'
import { gameRoutes } from '../../modules/games/game.routes'
import { userRoutes } from '../../modules/users/user.routes'

export const registerRoutes = async (app: FastifyInstance) => {
  app.register(authRoutes, { prefix: '/auth' })
  app.register(userRoutes, { prefix: '/users' })
  app.register(gameRoutes, { prefix: '/games' })
}