import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fP from 'fastify-plugin'

const authDecorator = (fastify: FastifyInstance, _: any, next: any) => {
  fastify.decorateRequest('userId', null)

  fastify.decorate(
    'auth',
    (req: FastifyRequest & { userId: string }, _: FastifyReply, done: any) => {
      const sessionId = req.session.get('session')
      if (sessionId) {
        req.userId = sessionId
      }
      done()
    }
  )

  next()
}

export default fP(authDecorator)
