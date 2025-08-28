import { FastifyInstance } from "fastify";
import usersController from "src/controllers/users.controller.js";
import userSchema from 'src/schemas/auth.schema.js'

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.post('/', userSchema.createUserSchema, usersController.createUserHandler);
	app.get('/me', userSchema.getCurrentUserSchema, usersController.getCurrentUserHandler);
	app.get('/:userId', userSchema.getUserByIdSchema, usersController.getUserByIdHandler);
	app.patch('/me', userSchema.updateUserSchema, usersController.updateUserHandler);
	// app.get('/:userId', userSchema.getUserByIdSchema, usersController.getUserByIdHandler); // query search
	// app.patch('/me/status', usersController.updateUserHandler); // status change
	// app.get('/:userId/status', userSchema.getUserByIdSchema, usersController.getUserByIdHandler); // get user status
}
