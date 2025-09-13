import Fastify, { FastifyInstance } from 'fastify';
import { LOG_LEVEL } from './env.js';
import { registerPlugins } from './plugins.js';
import { setErrorHandler } from './errorHandler.js';

export function buildApp(serviceName: string) {
	const app = Fastify({
		logger: {
			level: LOG_LEVEL,
			transport:
				process.env.NODE_ENV !== 'production'
					? { target: 'pino-pretty', options: { colorize: true } }
					: undefined,
		},
		trustProxy: true,
		bodyLimit: 1048576,
	});
	setErrorHandler(app, serviceName);
	return app;
}

export async function startServer(
	app: FastifyInstance,
	registerRoutes: (app: FastifyInstance) => Promise<void>,
	host: string,
	port: number
) {
	await registerPlugins(app, host, port);
	await registerRoutes(app);

	await app.listen({ port, host });
	app.log.info({ event: 'serverStart', message: `Server running at http://${host}:${port}` });

	const shutdown = async () => {
		try {
			await app.close();
			app.log.info({ event: 'shutdown', message: 'Server closed gracefully' });
			process.exit(0);
		} catch (err) {
			app.log.error({ event: 'shutdownError', message: (err as Error).message });
			process.exit(1);
		}
	};

	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);
	process.on('unhandledRejection', shutdown);
	process.on('uncaughtException', shutdown);
}
