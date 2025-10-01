import { FastifyReply } from 'fastify'
import sendError from '@core/utils/sendError.js';
import { twoFaDisable } from '@services/twofa/index.js';
import { AuthRequest } from '@core/types/authRequest.js';

const twoFaDisableHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;
		await twoFaDisable({ userId });

		return reply.status(200).send({
			status: 'success',
			message: '2FA disabled successfully.'
		});

	} catch (error) {
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			case '2FA_NOT_ENABLED':
				return sendError(reply, 400, error.code, '2FA is not enabled.');

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
}


export default twoFaDisableHandler;
