import { FastifyInstance } from "fastify";
import authController from "src/controllers/auth.controller.js";
import authSchema from "src/schemas/auth.schema.js";

const twofaRoutes = async (app: FastifyInstance) => {
	app.post('/setup', authSchema.twoFaSetupSchema, authController.twoFaSetupHandler);
	app.post('/confirm', authSchema.twoFaConfirmSchema, authController.twoFaConfirmHandler);
	app.post('/verify', authSchema.twoFaVerifySchema, authController.twoFaVerifyHandler);
	app.delete('/disable', authSchema.twoFaDisableSchema, authController.twoFaDisableHandler);
}

export default twofaRoutes;
