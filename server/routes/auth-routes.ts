import { PrismaClient } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { Exception } from '../libs/Exception'

async function routes(fastify: any) {
  const prisma = new PrismaClient()

  fastify.post(
    '/sign-up',
    async (
      req: FastifyRequest<{
        Body: {
          email: string
          name: string
          password: string
        }
      }>,
      reply: FastifyReply
    ) => {
      fastify.replyErrorInstance(reply)

      const { email, name, password } = req.body
      const candidate = await prisma.user.findFirst({
        where: {
          OR: [{ name }, { email }],
        },
      })
      if (candidate) {
        console.log(candidate)
        fastify.forbidden('User is exist')
        reply.send({ message: '', code: 403 })
      } else {
        const passwordHash = await fastify.bcrypt.hash(password, 12)
        await prisma.user.create({
          data: { email, name, password: passwordHash },
        })
        fastify.created('User has been created')
      }
    }
  )

  fastify.post(
    '/sign-in',
    async (
      req: FastifyRequest<{
        Body: {
          login: string
          password: string
        }
      }>,
      reply: FastifyReply
    ) => {
      fastify.replyErrorInstance(reply)

      const { login, password } = req.body
      const candidate = await prisma.user.findFirst({
        where: {
          OR: [{ name: { equals: login } }, { email: { equals: login } }],
        },
      })
      if (!candidate) {
        fastify.forbidden('User not exist')
      } else {
        const passwordDecode = await fastify.bcrypt.compare(
          password,
          candidate.password
        )
        if (!passwordDecode) {
          fastify.forbidden('NOT CORRECT PASSWORD')
        }
        const { password: userPassword, ...publicData } = candidate
        req.session.set('session', candidate.id)
        return publicData
      }
    }
  )

  fastify.get('/logout', (req: FastifyRequest, reply: FastifyReply) => {
    if (req.session.get('session')) {
      req.session.delete()
      return Exception.Ok('sign out')
    }
  })
}

export default routes
