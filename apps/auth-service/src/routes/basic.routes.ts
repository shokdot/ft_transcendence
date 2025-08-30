import { FastifyInstance } from "fastify";
import authController from "src/controllers/auth.controller.js";
import authSchema from "src/schemas/auth.schema.js";

const basicAuthRoutes = async (app: FastifyInstance) => {
	app.get('/me', authSchema.getCurrentUserSchema, authController.getCurrentUser);
	app.get('/verify-email', authSchema.verifyEmailSchema, authController.verifyUserHandler);
	app.post('/register', authSchema.registerSchema, authController.registerUserHandler);
	app.post('/login', authSchema.loginSchema, authController.loginUserHandler);
	app.post('/logout', authSchema.logoutUserSchema, authController.logoutUserHandler);
	app.post('/refresh', authSchema.refreshSchema, authController.refreshToken);
}

export default basicAuthRoutes;
