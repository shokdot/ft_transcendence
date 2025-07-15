import Fastify from 'fastify';
import authRoutes from './routes/auth.js'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'

const app = Fastify({ logger: true });

await app.register(swagger, {
	swagger: {
		info: {
			title: 'My Fastify API',
			description: 'API documentation using Swagger',
			version: '1.0.0',
		},
		host: 'localhost:3000',
		schemes: ['http'],
		consumes: ['application/json'],
		produces: ['application/json'],
	}
})

// Swagger UI
await app.register(swaggerUI, {
	routePrefix: '/docs',
	uiConfig: {
		docExpansion: 'full',
		deepLinking: false
	},
})

await app.register(authRoutes, { prefix: '/api/v1/auth' });

export default app;
