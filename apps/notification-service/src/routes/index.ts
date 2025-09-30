import { FastifyInstance } from "fastify";
import wsRoutes from "./ws.routes.js";
import notifyRoutes from "./notify.routes.js";

export default async function notificationRoutes(app: FastifyInstance): Promise<void> {
	app.register(notifyRoutes);
	app.register(wsRoutes);
}
