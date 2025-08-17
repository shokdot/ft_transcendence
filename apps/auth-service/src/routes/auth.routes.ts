import { FastifyInstance } from "fastify";
import authController from "../controllers/auth.controller.js";
import authSchema from "../schemas/auth.schema.js";

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.post('/register', authSchema.registerSchema, authController.registerUserHandler);
	app.post('/login', authSchema.loginSchema, authController.loginUserHandler);
	app.post('/refresh', authSchema.refreshSchema, authController.refreshToken);
	app.get('/verify-email', authSchema.verifyEmailSchema, authController.verifyUserHandler);
}
