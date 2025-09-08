import { FastifyReply } from 'fastify'
import sendError from '@core/utils/sendError.js';
import { twoFaSetup } from 'src/service/twofa/index.js'
import { AuthRequest } from '@core/types/authRequest.js';

const twoFaSetupHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const userId = request.userId;
		const data = await twoFaSetup({ userId });

		reply.status(200).send({
			status: 'success',
			data,
			message: '2FA setup initialized successfully'
		});

	} catch (error) {

		if (error.code === 'OAUTH_USER') {
			return sendError(reply, 400, error.code, '2FA cannot be activated for OAuth users.');

		}
		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default twoFaSetupHandler;
