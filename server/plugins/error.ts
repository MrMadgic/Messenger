import { FastifyInstance, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'

interface IException {
  message: string
  code: number
}

const errorPlugin = fp(async (fastify: FastifyInstance) => {
  let reply: FastifyReply

  fastify.decorate(
    'replyErrorInstance',
    (instance: FastifyReply) => (reply = instance)
  )

  const generateError = (data: IException) => {
    reply.statusCode = data.code
    reply.send(data.code >= 400 ? new Error(data.message) : data.message)
  }

  fastify.decorate('ok', (message: string) => {
    generateError({ code: 200, message })
  })
  fastify.decorate('created', (message: string) => {
    generateError({ code: 201, message })
  })
  fastify.decorate('unauthorized', (message: string) => {
    generateError({ code: 401, message })
  })
  fastify.decorate('forbidden', (message: string) => {
    generateError({ code: 403, message })
  })
})

export default errorPlugin
