import { FastifyRequest, FastifyReply } from 'fastify';
import authService from '../service/auth.service.js'
import sendError from '@core/utils/sendError.js';

const resetPassHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { token, password } = request.body as { token: string, password: string };
		await authService.resetPass(token, password);

		return reply.status(200).send({
			status: 'success',
			message: 'Password has been reset successfully.',
		});


	} catch (error: any) {
		if (error.code === 'INVALID_TOKEN') {
			return sendError(reply, 400, error.code, 'Invalid or expired token provided.', { field: 'token' })
		}
		if (error.code === 'WEAK_PASSWORD') {
			return sendError(reply, 400, error.code, 'Password is too weak', { field: 'password' })
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
	}
}

export default resetPassHandler;
