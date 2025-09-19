import { FastifyInstance } from "fastify";
import statusRoutes from "./status.routes.js";


export default async function notifyRoutes(app: FastifyInstance): Promise<void> {
	// app.register(basicRoutes, { prefix: '/notifications' });
	app.register(statusRoutes, { prefix: '/status' });
}
