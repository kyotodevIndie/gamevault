import { MultipartFile } from '@fastify/multipart'
import { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../../core/config/env'
import { ForbiddenError, NotFoundError, ValidationError } from '../../core/errors/index'
import { deleteFile, getPublicUrl, uploadFile } from '../../core/storage/index'
import { gameRepository } from './game.repository'

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp']
const IMAGE_TYPES = ['cover', 'banner'] as const
type ImageType = typeof IMAGE_TYPES[number]

type UploadParams = {
  Params: { id: string; type: ImageType }
}

export const gameUploadController = {
  async uploadImage(request: FastifyRequest<UploadParams>, reply: FastifyReply) {
    const { id, type } = request.params

    if (!IMAGE_TYPES.includes(type)) {
      throw new ValidationError({ type: ['Must be cover or banner'] })
    }

    const game = await gameRepository.findById(id)
    if (!game) throw new NotFoundError('Game')
    if (game.developer_id !== request.user.sub) throw new ForbiddenError()

    const data = await (request as FastifyRequest & { file(): Promise<MultipartFile | undefined> }).file()
    if (!data) throw new ValidationError({ file: ['File is required'] })

    if (!ALLOWED_MIMETYPES.includes(data.mimetype)) {
      throw new ValidationError({ file: ['Only JPEG, PNG and WebP are allowed'] })
    }

    const currentUrl = type === 'cover' ? game.cover_url : game.banner_url
    if (currentUrl) {
      const oldKey = currentUrl.split(`${env.STORAGE_BUCKET}/`)[1]
      if (oldKey) await deleteFile(oldKey).catch(() => {})
    }

    const buffer = await data.toBuffer()
    const key = await uploadFile(buffer, data.mimetype, `games/${id}/${type}`, data.filename)
    const publicUrl = getPublicUrl(key)

    const field = type === 'cover' ? 'cover_url' : 'banner_url'
    await gameRepository.update(id, { [field]: publicUrl })

    return reply.status(200).send({
      url: publicUrl,
      type,
    })
  },
}