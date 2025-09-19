import { FastifyInstance } from "fastify";
import { updateStatusHandler } from "src/controllers/status/index.js";
import authenticate from "@core/middlewares/authenticate.middleware.js"

const statusRoutes = async (app: FastifyInstance) => {
	app.get('/', { websocket: true, preHandler: authenticate }, updateStatusHandler);
}

export default statusRoutes;
