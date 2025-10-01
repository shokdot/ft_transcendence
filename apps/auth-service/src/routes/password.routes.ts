import { FastifyInstance } from "fastify";
import { password } from "@schemas/index.js";
import {
	forgotPassHandler,
	resetPassHandler,
	changePassHandler,
} from '@controllers/password/index.js'

const passwordRoutes = async (app: FastifyInstance) => {
	app.post('/forgot', password.forgotPass, forgotPassHandler);
	app.post('/reset', password.resetPass, resetPassHandler);
	app.put('/change', password.changePass, changePassHandler);
}

export default passwordRoutes;
