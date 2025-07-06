import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { registerHandler, loginHandler } from '../controllers/auth.controller'

async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
	fastify.post('/register', registerHandler)
	fastify.post('/login', loginHandler)
}

export default authRoutes
