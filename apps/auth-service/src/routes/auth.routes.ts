import { FastifyInstance } from "fastify";
import authController from "../controllers/auth.controller.js";
import authSchema from "../schemas/auth.schema.js";

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.get('/me', authSchema.getCurrentUserSchema, authController.getCurrentUser);
	app.get('/verify-email', authSchema.verifyEmailSchema, authController.verifyUserHandler);
	app.post('/register', authSchema.registerSchema, authController.registerUserHandler);
	app.post('/login', authSchema.loginSchema, authController.loginUserHandler);
	app.post('/logut', authSchema.logutUserSchema, authController.logoutUserHandler);
	app.post('/refresh', authSchema.refreshSchema, authController.refreshToken);
}
