import { z } from 'zod'

export const createGameSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  price: z.number().min(0).default(0),
  tags: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
})

export const updateGameSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  cover_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
})

export const listGamesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})

export type CreateGameDTO = z.infer<typeof createGameSchema>
export type UpdateGameDTO = z.infer<typeof updateGameSchema>
export type ListGamesDTO = z.infer<typeof listGamesSchema>

export interface GameRecord {
  id: string
  developer_id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  price: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  cover_url: string | null
  banner_url: string | null
  tags: string[]
  platforms: string[]
  download_count: number
  average_rating: string
  created_at: Date
  updated_at: Date
}