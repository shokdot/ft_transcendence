import authenticate from "@core/middlewares/authenticate.middleware.js";
import { FastifyInstance } from "fastify";
import {
	listFriendsHandler,
	sendRequestHandler,
	acceptRequestHandler,
	deleteRequestHandler
} from '@controllers/friends/index.js'

const friendsRoutes = async (app: FastifyInstance) => {
	app.get('/', { preHandler: authenticate }, listFriendsHandler);
	app.post('/:username', { preHandler: authenticate }, sendRequestHandler);
	app.patch('/:username', { preHandler: authenticate }, acceptRequestHandler);
	app.delete('/:username', { preHandler: authenticate }, deleteRequestHandler);
}

export default friendsRoutes;
