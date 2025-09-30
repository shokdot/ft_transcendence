import { FastifyInstance } from "fastify";
import {
	wsStatusHandler,
	wsNotificationHandler
} from '@controllers/ws/index.js'

export default async function wsRoutes(app: FastifyInstance) {
	app.get('/status/ws', { websocket: true }, wsStatusHandler);
	app.get('/ws', { websocket: true }, wsNotificationHandler);
}
