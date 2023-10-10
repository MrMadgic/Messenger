import { SocketStream } from '@fastify/websocket'
import { PrismaClient } from '@prisma/client'
import { FastifyRequest } from 'fastify'
import { Exception } from '../libs/Exception'

async function routes(fastify: any) {
  const prisma = new PrismaClient()

  fastify.addHook('onRequest', fastify.auth)

  fastify.get('/', async (req: FastifyRequest) => {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.headers.authorization },
          { receiverId: req.headers.authorization },
        ],
      },
    })
    return messages
  })

  fastify.post(
    '/:id/send',
    async (
      req: FastifyRequest<{ Body: { text: string }; Params: { id: string } }>
    ) => {
      try {
        await prisma.message.create({
          data: {
            text: req.body.text,
            receiverId: req.params.id,
            senderId: req.headers.authorization as string,
          },
        })
        return Exception.Ok('Sended')
      } catch (err) {
        console.log(err)
      }
    }
  )

  fastify.get(
    '/:id',
    { websocket: true },
    async (
      connection: SocketStream,
      req: FastifyRequest<{ Params: { id: string } }> & {
        userId: string
        user: any
      }
    ) => {
      connection.socket.on('message', async (message) => {
        console.log('user: ', req.user)
        console.log('req: ', req.session.get('session'))
        await prisma.message.create({
          data: {
            senderId: req.headers.authorization as string,
            text: message.toString(),
            receiverId: req.params.id,
          },
        })
      })

      connection.socket.on('close', () => {
        console.log('disconnected')
      })
    }
  )
}

export default routes
