import { FastifyInstance } from "fastify";
import usersController from "../controllers/users.controller.js";
import userSchema from '../schemas/auth.schema.js'
import authenticate from '@core/middlewares/authenticate.middleware.js'

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.post('/', userSchema.createUserSchema, usersController.createUserHandler);
	app.get('/me', { preHandler: authenticate }, usersController.getCurrentUserHandler);
}
