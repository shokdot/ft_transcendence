import 'dotenv/config'
import { FastifyInstance } from 'fastify';
import { buildApp, startServer, API_PREFIX } from '@core/index.js';
import { PORT, HOST, SERVICE_NAME } from './utils/env.js';
import healthRoutes from '@core/routes/health.routes.js';
import notifyRoutes from 'src/routes/index.js';
import ws from "@fastify/websocket";

const app: FastifyInstance = buildApp(SERVICE_NAME);
app.register(ws);

async function registerRoutes(app: FastifyInstance) {
	await app.register(healthRoutes, { prefix: API_PREFIX });
	await app.register(notifyRoutes, { prefix: `${API_PREFIX}/ws` });
}

startServer(app, registerRoutes, HOST, PORT);
