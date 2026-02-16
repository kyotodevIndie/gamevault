import { db } from '../../core/database/index'
import { CreateUserDTO } from './user.schema'

export interface UserRecord {
  id: string
  name: string
  email: string
  password_hash: string | null
  role: 'USER' | 'DEVELOPER' | 'ADMIN'
  avatar_url: string | null
  is_verified: boolean
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await db.query<UserRecord>(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email],
    )
    return result.rows[0] ?? null
  },

  async findById(id: string): Promise<UserRecord | null> {
    const result = await db.query<UserRecord>(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id],
    )
    return result.rows[0] ?? null
  },

  async create(data: CreateUserDTO & { password_hash: string }): Promise<UserRecord> {
    const result = await db.query<UserRecord>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.email, data.password_hash],
    )
    return result.rows[0]
  },
}