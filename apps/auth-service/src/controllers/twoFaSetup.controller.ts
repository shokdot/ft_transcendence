import { FastifyReply } from 'fastify'
import sendError from '../utils/sendError.js';
import authService from '../service/auth.service.js';
import { UserRequest } from '../types/userRequest.js';

const twoFaSetupHandler = async (request: UserRequest, reply: FastifyReply) => {
	try {
		const userId = request.userId;
		const data = await authService.twoFaSetup({ userId });

		reply.status(200).send({
			status: 'success',
			data,
			message: '2FA setup initialized successfully'
		});

	} catch (error) {

		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default twoFaSetupHandler;
