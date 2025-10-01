import { FastifyInstance } from "fastify";
import { basic } from '@schemas/index.js'
import {
	createUserHandler,
	getUserByIdHandler,
	getUserStatusHandler,
	getUserByNameHandler,
	searchUserHandler
} from '@controllers/basic/index.js'

const basicRoutes = async (app: FastifyInstance) => {
	app.post('/', basic.createUser, createUserHandler);
	app.get('/:userId', basic.getUserById, getUserByIdHandler);
	app.get('/:userId/status', basic.getUserStatus, getUserStatusHandler);
	app.get('/username/:username', basic.getUserByName, getUserByNameHandler);
	app.get('/search', basic.searchUser, searchUserHandler);
}

export default basicRoutes;
