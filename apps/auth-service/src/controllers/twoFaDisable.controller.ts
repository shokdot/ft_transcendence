import { FastifyReply } from 'fastify'
import sendError from '../utils/sendError.js';
import authService from '../service/auth.service.js';
import { UserRequest } from '../types/userRequest.js';

const twoFaDisableHandler = async (request: UserRequest, reply: FastifyReply) => {
	try {

		const { userId } = request;
		await authService.twoFaDisable({ userId });

		return reply.status(200).send({
			status: 'success',
			message: '2FA disabled successfully.'
		});

	} catch (error) {

		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}

		if (error.code === '2FA_NOT_ENABLED') {
			return sendError(reply, 400, error.code, '2FA is not enabled.');
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}


export default twoFaDisableHandler;
