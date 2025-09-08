import authenticate from "@core/middlewares/authenticate.middleware.js";
import { FastifyInstance } from "fastify";
import usersController from "src/controllers/users.controller.js";
import userSchema from 'src/schemas/auth.schema.js' //typo

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.post('/', userSchema.createUserSchema, usersController.createUserHandler);
	app.get('/me', userSchema.getCurrentUserSchema, usersController.getCurrentUserHandler);
	app.get('/:userId', userSchema.getUserByIdSchema, usersController.getUserByIdHandler);
	app.get('/u/:username', usersController.getUserByNameHandler);
	app.patch('/me', userSchema.updateUserSchema, usersController.updateUserHandler);
	app.patch('/me/status', userSchema.updateUserStatusSchema, usersController.updateStatusHandler);
	app.get('/search', { preHandler: authenticate }, usersController.searchUserHandler);
	app.get('/:userId/status', userSchema.getUserStatusSchema, usersController.getUserStatusHandler);
	// settings
	// avatar change, delete
	// Optional: last active timestamp (/:userId/last-active)
}
