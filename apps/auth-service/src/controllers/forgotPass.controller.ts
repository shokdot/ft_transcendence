import { FastifyRequest, FastifyReply } from 'fastify';
import authService from '../service/auth.service.js'
import sendError from '@core/utils/sendError.js';

const forgotPassHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { email } = request.body as { email: string };
		await authService.forgotPass(email);

		return reply.status(200).send({
			status: 'success',
			message: 'Reset link successfuly send to your email',
		});


	} catch (error: any) {
		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'You are not registered yet.', { field: 'email' })
		}
		if (error.code === 'OAUTH_USER') {
			return sendError(reply, 400, error.code, 'This account was created using an OAuth provider.')
		}
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
	}
}

export default forgotPassHandler;
