import { FastifyInstance } from "fastify";
import { twoFa } from "@schemas/index.js";
import {
	twoFaSetupHandler,
	twoFaConfirmHandler,
	twoFaVerifyHandler,
	twoFaDisableHandler,
} from '@controllers/twofa/index.js';

const twofaRoutes = async (app: FastifyInstance) => {
	app.post('/setup', twoFa.setup, twoFaSetupHandler);
	app.post('/confirm', twoFa.confirm, twoFaConfirmHandler);
	app.post('/verify', twoFa.verify, twoFaVerifyHandler);
	app.delete('/disable', twoFa.disable, twoFaDisableHandler);
}

export default twofaRoutes;
