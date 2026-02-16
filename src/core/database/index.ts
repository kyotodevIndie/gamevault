import pg from 'pg'
import { env } from '../config/env'
import { logger } from '../logger/index'

const { Pool } = pg

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

db.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle postgres client')
  process.exit(1)
})

export const connectDatabase = async () => {
  const client = await db.connect()
  client.release()
  logger.info('Database connected successfully')
}