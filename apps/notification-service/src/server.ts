import 'dotenv/config'
import { FastifyInstance } from 'fastify';
import { buildApp, startServer, API_PREFIX } from '@core/index.js';
import { PORT, HOST, SERVICE_NAME } from './utils/env.js';
import healthRoutes from '@core/routes/health.routes.js';
import notificationRoutes from 'src/routes/index.js';
import ws from "@fastify/websocket";

const app: FastifyInstance = buildApp(SERVICE_NAME);
app.register(ws);

async function registerRoutes(app: FastifyInstance) {
	await app.register(healthRoutes, { prefix: `${API_PREFIX}/notifications` });
	await app.register(notificationRoutes, { prefix: `${API_PREFIX}/notifications` });
}

startServer(app, registerRoutes, HOST, PORT);
