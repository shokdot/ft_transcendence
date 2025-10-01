import { FastifyInstance } from "fastify";
import { me } from 'src/schemas/index.js'
import {
	getCurrentUserHandler,
	updateUserHandler,
	deleteUserHandler,
	updateStatusHandler
} from '@controllers/me/index.js'

const meRoutes = async (app: FastifyInstance) => {
	app.get('/', me.getCurrentUser, getCurrentUserHandler);
	app.patch('/', me.updateUser, updateUserHandler);
	app.delete('/', me.deleteUser, deleteUserHandler);
	app.patch('/status', me.updateUserStatus, updateStatusHandler);
}

export default meRoutes;
