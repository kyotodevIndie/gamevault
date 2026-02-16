import multipart from '@fastify/multipart'
import fastify from 'fastify'
import { connectCache, redis } from './core/cache/index'
import { env } from './core/config/env'
import { connectDatabase, db } from './core/database/index'
import { logger } from './core/logger/index'
import { connectStorage } from './core/storage/index'
import { registerRoutes } from './http/routes/index'
import { errorHandler } from './shared/middlewares/error-handler'

const app = fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
})

app.setErrorHandler(errorHandler)

app.get('/health', async (request, reply) => {
  const checks = {
    database: false,
    redis: false,
    uptime: process.uptime(),
  }

  try {
    await db.query('SELECT 1')
    checks.database = true
  } catch {}

  try {
    await redis.ping()
    checks.redis = true
  } catch {}

  const isHealthy = checks.database && checks.redis

  return reply.status(isHealthy ? 200 : 503).send({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  })
})

const start = async () => {
  try {
    await connectDatabase()
    await connectCache()
    await connectStorage()
    
    await app.register(multipart, {
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
        files: 1,
      },
    })

    await registerRoutes(app)
    
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    })
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
}

start()