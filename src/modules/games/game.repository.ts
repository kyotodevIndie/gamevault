import { db } from '../../core/database/index'
import { CreateGameDTO, GameRecord, ListGamesDTO, UpdateGameDTO } from './game.schema'

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const gameRepository = {
  async create(developerId: string, data: CreateGameDTO): Promise<GameRecord> {
    const baseSlug = generateSlug(data.title)
    const slug = `${baseSlug}-${Date.now()}`

    const result = await db.query<GameRecord>(
      `INSERT INTO games (developer_id, title, slug, description, short_description, price, tags, platforms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        developerId,
        data.title,
        slug,
        data.description ?? null,
        data.short_description ?? null,
        data.price,
        data.tags,
        data.platforms,
      ],
    )

    return result.rows[0]
  },

  async findById(id: string): Promise<GameRecord | null> {
    const result = await db.query<GameRecord>(
      'SELECT * FROM games WHERE id = $1',
      [id],
    )
    return result.rows[0] ?? null
  },

  async findBySlug(slug: string): Promise<GameRecord | null> {
    const result = await db.query<GameRecord>(
      'SELECT * FROM games WHERE slug = $1',
      [slug],
    )
    return result.rows[0] ?? null
  },

  async list(filters: ListGamesDTO): Promise<{ games: GameRecord[], total: number }> {
    const offset = (filters.page - 1) * filters.limit
    const conditions: string[] = ['1=1']
    const values: unknown[] = []
    let paramCount = 1

    if (filters.search) {
      conditions.push(`title ILIKE $${paramCount}`)
      values.push(`%${filters.search}%`)
      paramCount++
    }

    if (filters.tag) {
      conditions.push(`$${paramCount} = ANY(tags)`)
      values.push(filters.tag)
      paramCount++
    }

    if (filters.status) {
      conditions.push(`status = $${paramCount}`)
      values.push(filters.status)
      paramCount++
    }

    const where = conditions.join(' AND ')

    const countResult = await db.query<{ count: string }>(
      `SELECT COUNT(*) FROM games WHERE ${where}`,
      values,
    )

    const gamesResult = await db.query<GameRecord>(
      `SELECT * FROM games WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, filters.limit, offset],
    )

    return {
      games: gamesResult.rows,
      total: parseInt(countResult.rows[0].count),
    }
  },

  async update(id: string, data: UpdateGameDTO): Promise<GameRecord | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramCount = 1
    
    console.log('UPDATE DATA:', data) // log temporário
  console.log('FIELDS:', fields)    // log temporário

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount}`)
      values.push(data.title)
      paramCount++
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramCount}`)
      values.push(data.description)
      paramCount++
    }

    if (data.short_description !== undefined) {
      fields.push(`short_description = $${paramCount}`)
      values.push(data.short_description)
      paramCount++
    }

    if (data.price !== undefined) {
      fields.push(`price = $${paramCount}`)
      values.push(data.price)
      paramCount++
    }

    if (data.tags !== undefined) {
      fields.push(`tags = $${paramCount}`)
      values.push(data.tags)
      paramCount++
    }

    if (data.platforms !== undefined) {
      fields.push(`platforms = $${paramCount}`)
      values.push(data.platforms)
      paramCount++
    }

    if (data.cover_url !== undefined) {
      fields.push(`cover_url = $${paramCount}`)
      values.push(data.cover_url)
      paramCount++
    }
    
    if (data.banner_url !== undefined) {
      fields.push(`banner_url = $${paramCount}`)
      values.push(data.banner_url)
      paramCount++
    }

    if (fields.length === 0) return null

    

    fields.push(`updated_at = now()`)
    values.push(id)

    const result = await db.query<GameRecord>(
      `UPDATE games SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values,
    )

    return result.rows[0] ?? null
  },

  async updateStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): Promise<GameRecord | null> {
    const result = await db.query<GameRecord>(
      `UPDATE games SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, id],
    )
    return result.rows[0] ?? null
  },

  async delete(id: string): Promise<void> {
    await db.query('DELETE FROM games WHERE id = $1', [id])
  },
}