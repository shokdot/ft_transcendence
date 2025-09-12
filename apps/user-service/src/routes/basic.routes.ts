import { FastifyInstance } from "fastify";
import { basic } from 'src/schemas/index.js'
import authenticate from "@core/middlewares/authenticate.middleware.js";
import {
	createUserHandler,
	getUserByIdHandler,
	getUserStatusHandler,
	getUserByNameHandler,
	searchUserHandler
} from 'src/controllers/basic/index.js'

const basicRoutes = async (app: FastifyInstance) => {
	app.post('/', basic.createUser, createUserHandler);
	app.get('/:userId', basic.getUserById, getUserByIdHandler);
	app.get('/:userId/status', basic.getUserStatus, getUserStatusHandler);
	app.get('/username/:username', getUserByNameHandler); // add schema
	app.get('/search', { preHandler: authenticate }, searchUserHandler); // add schema
}

export default basicRoutes;
