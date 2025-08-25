import Fastify, { FastifyReply } from 'fastify';
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import rateLimit from '@fastify/rate-limit';
import userRoutes from './routes/user.routes.js'
import sendError from '@core/utils/sendError.js'

const app = Fastify({ logger: true });

await app.register(swagger, {
	swagger: {
		info: {
			title: 'ft_transcendence',
			description: 'Auth Service documentation',
			version: '1.0.0',
		},
		host: 'localhost:3001',
		schemes: ['http'],
		consumes: ['application/json'],
		produces: ['application/json'],
	}
})

await app.register(swaggerUI, {
	routePrefix: '/docs',
	uiConfig: {
		docExpansion: 'full',
		deepLinking: false
	},
})

app.setErrorHandler((error, _, reply: FastifyReply) => {
	if (error.validation) {
		const firstError = error.validation[0];
		const field = firstError.instancePath?.replace(/^\//, '') || firstError.params?.missingProperty || 'unknown';
		const message = firstError.message;

		const details = { field, message };
		return sendError(reply, 400, 'VALIDATION_FAILED', `Request ${error.validationContext} validation failed`, details);
	}

	return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', error.message || 'Something went wrong');
});

app.register(rateLimit, {
	max: 5,
	timeWindow: '1 minute',
	keyGenerator: (request) => {
		return request.ip;
	},
	errorResponseBuilder: () => ({
		status: 'error',
		error: 'TOO_MANY_REQUESTS',
		message: 'Too many login attempts. Please try again later.'
	})
});

await app.register(userRoutes, { prefix: '/api/v1/users' });

export default app;
