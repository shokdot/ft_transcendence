import { FastifyRequest, FastifyReply } from 'fastify';
import sendError from '@core/utils/sendError.js';
import { resetPass } from 'src/service/password/index.js'
import resetPasswordDTO from 'src/dto/reset-password.dto.js';

const resetPassHandler = async (request: FastifyRequest<{ Body: resetPasswordDTO }>, reply: FastifyReply) => {
	try {
		const { token, password } = request.body;
		await resetPass(token, password);

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
