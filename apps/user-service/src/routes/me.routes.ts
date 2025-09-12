import { FastifyInstance } from "fastify";
import { me } from 'src/schemas/index.js'
import authenticate from "@core/middlewares/authenticate.middleware.js";
import {
	getCurrentUserHandler,
	updateUserHandler,
	deleteUserHandler,
	updateStatusHandler
} from 'src/controllers/me/index.js'

const meRoutes = async (app: FastifyInstance) => {
	app.get('/', me.getCurrentUser, getCurrentUserHandler);
	app.patch('/', me.updateUser, updateUserHandler);
	app.delete('/', { preHandler: authenticate }, deleteUserHandler); // add schema
	app.patch('/status', me.updateUserStatus, updateStatusHandler);
}

export default meRoutes;
