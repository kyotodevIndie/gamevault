import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const refreshTokenSchema = z.object({
  refresh_token: z.string(),
})

export type LoginDTO = z.infer<typeof loginSchema>
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>

export interface TokenPayload {
  sub: string
  role: 'USER' | 'DEVELOPER' | 'ADMIN'
}

export interface AuthResponseDTO {
  access_token: string
  refresh_token: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}