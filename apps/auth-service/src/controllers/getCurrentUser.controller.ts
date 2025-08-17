import { FastifyReply } from 'fastify';
import { UserRequest } from '../types/userRequest.js';
import authService from '../service/auth.service.js';
import sendError from '../utils/sendError.js';

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
