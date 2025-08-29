import { FastifyRequest, FastifyReply } from 'fastify';
import RegisterBody from '../types/registerBody.js';
import authService from '../service/auth.service.js'
import sendError from '@core/utils/sendError.js';

const passForgotHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { email } = request.body as { email: string };
		await authService.passForgot(email);

		return reply.status(200).send({
			status: 'success',
			message: 'Reset link successfuly send to your email',
		});


	} catch (error: any) {
		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'You are not registered yet.', { field: 'email' })
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
	}
}

export default passForgotHandler;
