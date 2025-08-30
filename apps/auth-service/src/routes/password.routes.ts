import authenticate from "@core/middlewares/authenticate.middleware.js";
import { FastifyInstance } from "fastify";
import authController from "src/controllers/auth.controller.js";
import authSchema from "src/schemas/auth.schema.js";

const passwordRoutes = async (app: FastifyInstance) => {
	app.post('/forgot', authSchema.forgotPassSchema, authController.forgotPassHandler);
	app.post('/reset', authSchema.resetPassSchema, authController.resetPassHandler);
	app.put('/change', authSchema.changePassSchema, authController.changePassHandler);
}

export default passwordRoutes;
