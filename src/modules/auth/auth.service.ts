import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { redis } from '../../core/cache/index'
import { env } from '../../core/config/env'
import { UnauthorizedError } from '../../core/errors/index'
import { userRepository } from '../users/user.repository'
import { AuthResponseDTO, LoginDTO, RefreshTokenDTO, TokenPayload } from './auth.schema'

const generateTokens = (payload: TokenPayload) => {
  const access_token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  })

  const refresh_token = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  })

  return { access_token, refresh_token }
}
export const authService = {
  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await userRepository.findByEmail(data.email)

    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    if (!user.password_hash) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password_hash)

    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const payload: TokenPayload = {
      sub: user.id,
      role: user.role,
    }

    const { access_token, refresh_token } = generateTokens(payload)

    await redis.set(
      `refresh_token:${user.id}`,
      refresh_token,
      'EX',
      60 * 60 * 24 * 30,
    )

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  },

  async refresh(data: RefreshTokenDTO): Promise<{ access_token: string }> {
    try {
      const payload = jwt.verify(data.refresh_token, env.JWT_REFRESH_SECRET) as TokenPayload

      const stored = await redis.get(`refresh_token:${payload.sub}`)

      if (!stored || stored !== data.refresh_token) {
        throw new UnauthorizedError('Invalid refresh token')
      }

      const access_token = jwt.sign(
        { sub: payload.sub, role: payload.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN },
      )

      return { access_token }
    } catch {
      throw new UnauthorizedError('Invalid refresh token')
    }
  },

  async logout(userId: string): Promise<void> {
    await redis.del(`refresh_token:${userId}`)
  },
}