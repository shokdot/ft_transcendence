import 'dotenv/config'
import { FastifyInstance } from 'fastify';
import { buildApp, startServer, API_PREFIX } from '@core/index.js';
import { PORT, HOST, SERVICE_NAME } from './utils/env.js';
import healthRoutes from '@core/routes/health.routes.js';
import userRoutes from 'src/routes/index.js';

const app: FastifyInstance = buildApp(SERVICE_NAME);

async function registerRoutes(app: FastifyInstance) {
	await app.register(healthRoutes, { prefix: `${API_PREFIX}/users` });
	await app.register(userRoutes, { prefix: `${API_PREFIX}/users` });
}

startServer(app, registerRoutes, HOST, PORT);
