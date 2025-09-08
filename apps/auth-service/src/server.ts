import 'dotenv/config';
import app from './core/index.js';
import { PORT, HOST } from './core/env.js';

const start = async (): Promise<void> => {
	try {

		await app.listen({ port: PORT, host: HOST });
		app.log.info({
			event: 'serverStart',
			message: `Server running at http://${HOST}:${PORT}`,
		});
	} catch (err: unknown) {
		app.log.error({
			event: 'serverStartError',
			message: err instanceof Error ? err.message : JSON.stringify(err),
			stack: err instanceof Error ? err.stack : undefined,
		});
		process.exit(1);
	}
};

const shutdown = async (): Promise<void> => {
	try {
		await app.close();
		app.log.info({
			event: 'shutdown',
			message: 'Server closed gracefully',
		});
		process.exit(0);
	} catch (err: unknown) {
		app.log.error({
			event: 'shutdownError',
			message: err instanceof Error ? err.message : JSON.stringify(err),
			stack: err instanceof Error ? err.stack : undefined,
		});
		process.exit(1);
	}
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason: unknown) => {
	app.log.error({
		event: 'unhandledRejection',
		message: reason instanceof Error ? reason.message : JSON.stringify(reason),
		stack: reason instanceof Error ? reason.stack : undefined,
	});
	process.exit(1);
});

process.on('uncaughtException', (err: unknown) => {
	app.log.error({
		event: 'uncaughtException',
		message: err instanceof Error ? err.message : JSON.stringify(err),
		stack: err instanceof Error ? err.stack : undefined,
	});
	process.exit(1);
});

start();
