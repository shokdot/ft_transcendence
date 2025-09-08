import Fastify from 'fastify';
import { registerPlugins } from './plugins.js';
import authRoutes from 'src/routes/index.js'
import { setErrorHandler } from './errorHandler.js';
import { LOG_LEVEL } from './env.js';
import { API_PREFIX } from 'src/core/env.js'
import healthRoutes from "src/routes/health.routes.js";

const app = Fastify({
	logger: {
		level: LOG_LEVEL,
		transport:
			process.env.NODE_ENV !== 'production'
				? { target: 'pino-pretty', options: { colorize: true } }
				: undefined,
	},
});

await registerPlugins(app);
setErrorHandler(app);
await app.register(healthRoutes, { prefix: API_PREFIX });
await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });

export default app;
