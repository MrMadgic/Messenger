import { PrismaClient, User } from '@prisma/client'
import { FastifyRequest } from 'fastify'
import { Exception } from '../libs/Exception'

async function routes(fastify: any) {
  const prisma = new PrismaClient()

  fastify.get('/', async (req: FastifyRequest) => {
    const sessionId = req.session.get('session')
    if (!sessionId) {
      return Exception.Unauthorized('Please sign in again ;(')
    }

    const candidate = await prisma.user.findFirst({
      where: { id: req.session.get('session') },
    })
    return candidate
  })

  fastify.get(
    '/:username',
    async (req: FastifyRequest<{ Params: { username: string } }>) => {
      const users = (await prisma.user.findMany({
        where: {
          OR: [
            {
              email: {
                contains: req.params.username,
              },
            },
            {
              name: {
                contains: req.params.username,
              },
            },
          ],
        },
        select: {
          name: true,
          id: true,
        },
      })) as User[]
      if (!users.length) {
        throw Exception.Forbidden('Users not found')
      } else {
        return users
      }
    }
  )

  fastify.patch(
    '/',
    {
      preHandler: fastify.upload.single('avatar'),
    },
    async (req: FastifyRequest<{ Body: Partial<User> }> & any) => {
      let data = req.body
      if (req.file) {
        const avatar = await fastify.uploadFile(req.file.buffer)
        console.log(avatar)
        data = { ...data, avatar }
      }

      await prisma.user.update({
        where: { id: '652832446c9f4b480e9ae836' },
        data: req.body,
      })
      return Exception.Created('User has been updated!')
    }
  )
}

export default routes
