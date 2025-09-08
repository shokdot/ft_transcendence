import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import rateLimit from '@fastify/rate-limit';
import fastifyCookie from '@fastify/cookie';
import { COOKIE_SECRET } from './env.js';
import { PORT, HOST } from './env.js';

export async function registerPlugins(app: FastifyInstance) {
	if (process.env.NODE_ENV !== 'production') {
		await app.register(swagger, {
			openapi: {
				openapi: '3.0.0',
				info: {
					title: 'ft_transcendence',
					description: 'Auth Service documentation',
					version: '1.0.0',
				},
				servers: [
					{
						url: `http://${HOST}:${PORT}`,
						description: 'Development server',
					},
				],
			},
		});
		await app.register(swaggerUI, {
			routePrefix: '/docs',
			uiConfig: { docExpansion: 'full', deepLinking: false },
		});
	}

	await app.register(rateLimit, { // improve most clever way
		max: 5,
		timeWindow: '1 minute',
		keyGenerator: (req) => req.ip,
		errorResponseBuilder: () => ({
			status: 'error',
			error: 'TOO_MANY_REQUESTS',
			message: 'Too many login attempts. Please try again later.',
		}),
	});

	await app.register(fastifyCookie, { secret: COOKIE_SECRET, parseOptions: {} });
}
