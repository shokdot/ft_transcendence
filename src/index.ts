import * as dotenv from 'dotenv'
dotenv.config()

import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'

const fastify = Fastify({ logger: true })

fastify.register(fastifyJwt, {
	secret: process.env.JWT_SECRET || 'supersecret'
})

import authRoutes from './routes/auth'

fastify.register(authRoutes, { prefix: '/auth' })

fastify.get('/', async (request, reply) => {
	return { hello: 'world' }
})

const start = async () => {
	try {
		const port: number = Number(process.env.PORT) || 3000;
		await fastify.listen({ port });
		console.log(`Server running at http://localhost:${port}}`);
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

start()
