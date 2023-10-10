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
      const { email, name, password } = req.body
      const candidate = await prisma.user.findFirst({
        where: {
          OR: [{ name }, { email }],
        },
      })
      if (candidate) {
        reply.send({ message: 'User is exist', code: 403 })
      } else {
        const passwordHash = await fastify.bcrypt.hash(password, 12)
        await prisma.user.create({
          data: { email, name, password: passwordHash },
        })
        reply.send({ message: 'User has been created', code: 201 })
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
      }>
    ) => {
      const { login, password } = req.body
      const candidate = await prisma.user.findFirst({
        where: {
          OR: [{ name: { equals: login } }, { email: { equals: login } }],
        },
      })
      if (!candidate) {
        return { message: 'User not exist', code: 403 }
      }

      const passwordDecode = await fastify.bcrypt.compare(
        password,
        candidate.password
      )
      if (!passwordDecode) {
        return { message: 'NOT CORRECT PASSWORD' }
      }
      const { password: userPassword, ...publicData } = candidate
      req.session.set('session', candidate.id)
      return publicData
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
