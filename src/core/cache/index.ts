import Redis from 'ioredis'
import { env } from '../config/env'
import { logger } from '../logger/index'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

redis.on('connect', () => {
  logger.info('Redis connected successfully')
})

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error')
})

export const connectCache = async () => {
  await redis.ping()
  logger.info('Redis ready')
}