import { FastifyInstance } from "fastify";
import { registerUserHandler, loginUserHandler } from "../controllers/auth.controller.js";

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.post('/register', registerUserHandler);
	app.post('/login', loginUserHandler);
}
