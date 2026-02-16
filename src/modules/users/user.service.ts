import bcrypt from 'bcryptjs'
import { ConflictError, NotFoundError } from '../../core/errors/index'
import { userRepository } from './user.repository'
import { CreateUserDTO, UserResponseDTO } from './user.schema'

const toResponseDTO = (user: any): UserResponseDTO => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar_url: user.avatar_url,
  is_verified: user.is_verified,
  created_at: user.created_at,
})

export const userService = {
  async register(data: CreateUserDTO): Promise<UserResponseDTO> {
    const existing = await userRepository.findByEmail(data.email)

    if (existing) {
      throw new ConflictError('Email')
    }

    const password_hash = await bcrypt.hash(data.password, 10)

    const user = await userRepository.create({
      ...data,
      password_hash,
    })

    return toResponseDTO(user)
  },

  async findById(id: string): Promise<UserResponseDTO> {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new NotFoundError('User')
    }

    return toResponseDTO(user)
  },
}