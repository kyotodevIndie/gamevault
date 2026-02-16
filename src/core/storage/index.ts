import { CreateBucketCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { extname } from 'path'
import { env } from '../config/env'
import { logger } from '../logger/index'

export const s3 = new S3Client({
  endpoint: env.STORAGE_ENDPOINT,
  region: env.STORAGE_REGION,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY,
    secretAccessKey: env.STORAGE_SECRET_KEY,
  },
  forcePathStyle: true, // necessário para MinIO
})

export const connectStorage = async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.STORAGE_BUCKET }))
    logger.info('Storage bucket already exists')
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: env.STORAGE_BUCKET }))
    logger.info(`Storage bucket "${env.STORAGE_BUCKET}" created`)
  }
}

export const uploadFile = async (
  file: Buffer,
  mimetype: string,
  folder: string,
  originalName: string,
): Promise<string> => {
  const ext = extname(originalName)
  const key = `${folder}/${randomUUID()}${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: key,
    Body: file,
    ContentType: mimetype,
  }))

  return key
}

export const deleteFile = async (key: string): Promise<void> => {
  await s3.send(new DeleteObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: key,
  }))
}

export const getSignedFileUrl = async (key: string, expiresIn = 3600): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: key,
  })
  return getSignedUrl(s3, command, { expiresIn })
}

export const getPublicUrl = (key: string): string => {
  return `${env.STORAGE_ENDPOINT}/${env.STORAGE_BUCKET}/${key}`
}