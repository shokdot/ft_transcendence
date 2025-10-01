import { FastifyReply } from 'fastify';
import { AuthRequest } from '@core/types/authRequest.js';
import sendError from '@core/utils/sendError.js';
import { getCurrentUser } from '@services/basic/index.js';

const getCurrentUserHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const data = await getCurrentUser({ userId });

		reply.status(200).send({
			status: 'success',
			data,
			message: 'Successfully sent data'
		});

	}
	catch (error: any) {
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}

	}
}

export default getCurrentUserHandler;
