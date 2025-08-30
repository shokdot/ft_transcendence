import { FastifyInstance } from "fastify";
import authController from "src/controllers/auth.controller.js";
import authSchema from "src/schemas/auth.schema.js";

const passwordRoutes = async (app: FastifyInstance) => {
	app.post('/password/forgot', authSchema.forgotPassSchema, authController.passForgotHandler);
}

export default passwordRoutes;
