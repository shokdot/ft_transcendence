import { FastifyInstance } from "fastify";
import usersController from "../controllers/users.controller.js";
import authenticate from '@core/middlewares/authenticate.middleware.js'

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.post('/', usersController.createUserHandler);
	app.get('/me', { preHandler: authenticate }, usersController.getCurrentUserHandler);
}
