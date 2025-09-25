import { FastifyInstance } from "fastify";
import { updateStatusHandler } from "src/controllers/status/index.js";

const statusRoutes = async (app: FastifyInstance) => {
	app.get('/', { websocket: true }, updateStatusHandler);
}

export default statusRoutes;
