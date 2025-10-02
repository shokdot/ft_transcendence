import 'dotenv/config';
import { FastifyInstance } from 'fastify';
import { buildApp, startServer, API_PREFIX } from '@core/index.js';
import authRoutes from './routes/index.js';
import healthRoutes from '@core/routes/health.routes.js';
import { PORT, HOST, SERVICE_NAME } from 'src/utils/env.js';

const app: FastifyInstance = buildApp(SERVICE_NAME);

async function registerRoutes(app: FastifyInstance) {
	await app.register(healthRoutes, { prefix: `${API_PREFIX}/auth` });
	await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
}

startServer(app, registerRoutes, HOST, PORT);
