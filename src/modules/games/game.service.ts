import { ForbiddenError, NotFoundError } from '../../core/errors/index'
import { gameRepository } from './game.repository'
import { CreateGameDTO, GameRecord, ListGamesDTO, UpdateGameDTO } from './game.schema'

const toResponseDTO = (game: GameRecord) => ({
  id: game.id,
  developer_id: game.developer_id,
  title: game.title,
  slug: game.slug,
  description: game.description,
  short_description: game.short_description,
  price: parseFloat(game.price),
  status: game.status,
  cover_url: game.cover_url,
  banner_url: game.banner_url,
  tags: game.tags,
  platforms: game.platforms,
  download_count: game.download_count,
  average_rating: parseFloat(game.average_rating),
  created_at: game.created_at,
  updated_at: game.updated_at,
})

export const gameService = {
  async create(developerId: string, data: CreateGameDTO) {
    const game = await gameRepository.create(developerId, data)
    return toResponseDTO(game)
  },

  async findById(id: string) {
    const game = await gameRepository.findById(id)
    if (!game) throw new NotFoundError('Game')
    return toResponseDTO(game)
  },

  async findBySlug(slug: string) {
    const game = await gameRepository.findBySlug(slug)
    if (!game) throw new NotFoundError('Game')
    return toResponseDTO(game)
  },

  async list(filters: ListGamesDTO) {
    const { games, total } = await gameRepository.list(filters)
    const page = filters.page
    const limit = filters.limit

    return {
      data: games.map(toResponseDTO),
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    }
  },

  async update(id: string, developerId: string, data: UpdateGameDTO) {
    const game = await gameRepository.findById(id)
    if (!game) throw new NotFoundError('Game')
    if (game.developer_id !== developerId) throw new ForbiddenError()

    const updated = await gameRepository.update(id, data)
    return toResponseDTO(updated!)
  },

  async publish(id: string, developerId: string) {
    const game = await gameRepository.findById(id)
    if (!game) throw new NotFoundError('Game')
    if (game.developer_id !== developerId) throw new ForbiddenError()

    const updated = await gameRepository.updateStatus(id, 'PUBLISHED')
    return toResponseDTO(updated!)
  },

  async archive(id: string, developerId: string) {
    const game = await gameRepository.findById(id)
    if (!game) throw new NotFoundError('Game')
    if (game.developer_id !== developerId) throw new ForbiddenError()

    const updated = await gameRepository.updateStatus(id, 'ARCHIVED')
    return toResponseDTO(updated!)
  },

  async delete(id: string, developerId: string) {
    const game = await gameRepository.findById(id)
    if (!game) throw new NotFoundError('Game')
    if (game.developer_id !== developerId) throw new ForbiddenError()

    await gameRepository.delete(id)
  },
}