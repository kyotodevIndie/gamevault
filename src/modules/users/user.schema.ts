import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['USER', 'DEVELOPER', 'ADMIN']),
  avatar_url: z.string().nullable(),
  is_verified: z.boolean(),
  created_at: z.date(),
})

export type CreateUserDTO = z.infer<typeof createUserSchema>
export type UserResponseDTO = z.infer<typeof userResponseSchema>