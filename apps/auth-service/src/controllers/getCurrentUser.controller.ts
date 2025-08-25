import { FastifyReply } from 'fastify';
import { UserRequest } from '@core/types/userRequest.js';
import sendError from '@core/utils/sendError.js';
import authService from '../service/auth.service.js';

const getCurrentUser = async (request: UserRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const data = await authService.getCurrentUser({ userId });

		reply.status(200).send({
			status: 'success',
			data,
			message: 'Successfully sent data'
		});


	}
	catch (error: any) {

		if (error.code === 'USER_NOT_FOUND')
			return sendError(reply, 404, error.code, 'The requested user does not exist.');

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default getCurrentUser;
