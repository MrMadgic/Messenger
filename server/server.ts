import Fastify from 'fastify'

import cors from '@fastify/cors'
import env from '@fastify/env'
import session from '@fastify/secure-session'
import websocket from '@fastify/websocket'
import bcrypt from 'fastify-bcrypt'
import uuid from 'fastify-uuid'

import authPlugin from './plugins/auth'
import cloudinaryPlugin from './plugins/cloudinary'
import connector from './plugins/connector'

import authRoutes from './routes/auth-routes'
import chatRoutes from './routes/chat-routes'
import userRoutes from './routes/user-routes'

const PORT = Number(process.env.PORT) || 5252

const fastify = Fastify({
  logger: false,
  ignoreTrailingSlash: true,
})

fastify.register(cors, {
  origin: 'http://localhost:5173',
  credentials: true,
})
fastify.register(uuid)
fastify.register(bcrypt)
fastify.register(websocket)
fastify.register(env, {
  schema: {
    type: 'object',
    required: ['PORT'],
    properties: {
      PORT: {
        type: 'string',
        default: 5151,
      },
      SESSION_SECRET: {
        type: 'string',
      },
    },
  },
})
// fastify.register(cookie)
fastify.register(session, {
  secret: process.env.SESSION_SECRET as string,
  cookie: {
    path: '/',
  },
  resave: true,
  saveUninitialized: false,
} as any)

fastify.register(connector)
fastify.register(cloudinaryPlugin)
fastify.register(authPlugin)

fastify.register(authRoutes, { prefix: 'auth' })
fastify.register(userRoutes, { prefix: 'user' })
fastify.register(chatRoutes, { prefix: 'chat' })

const main = async () => {
  try {
    await fastify.listen({ port: PORT })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
main()
