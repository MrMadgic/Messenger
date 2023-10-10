import { v2 as cloudinary } from 'cloudinary'
import multer from 'fastify-multer'
import fP from 'fastify-plugin'

import { FastifyInstance } from 'fastify'
import { uploadFile } from '../utils/file'

async function cloudinaryPlugin(fastify: FastifyInstance) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
  })

  fastify.register(multer.contentParser)

  const storage = multer.memoryStorage()
  const upload = multer({ storage })

  fastify.decorate('upload', upload)
  fastify.decorate('uploadFile', uploadFile(cloudinary))
}

export default fP(cloudinaryPlugin)
