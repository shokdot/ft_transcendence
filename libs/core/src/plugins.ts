import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import rateLimit from '@fastify/rate-limit';
import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { COOKIE_SECRET } from './env.js';

export async function registerPlugins(app: FastifyInstance, host: string, port: number) {
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
						url: `http://${host}:${port}`,
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

	await app.register(helmet, {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", "data:"],
				connectSrc: ["'self'"],
				fontSrc: ["'self'", "https:", "data:"],
				objectSrc: ["'none'"],
				upgradeInsecureRequests: [],
			},
		},
		crossOriginEmbedderPolicy: true,
		crossOriginOpenerPolicy: true,
		crossOriginResourcePolicy: { policy: 'same-origin' },
		referrerPolicy: { policy: 'no-referrer' },
		xssFilter: true,
		hidePoweredBy: true,
	});

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
