import { FastifyInstance } from "fastify";
import authController from "../controllers/auth.controller.js";
import registerSchema from "../schemas/auth.register.schema.js";
import loginSchema from "../schemas/auth.login.schema.js";

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.post('/register', registerSchema, authController.registerUserHandler);
	app.post('/login', loginSchema, authController.loginUserHandler);
}
