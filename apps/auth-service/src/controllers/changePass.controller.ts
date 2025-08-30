import { FastifyReply } from 'fastify';
import authService from '../service/auth.service.js'
import sendError from '@core/utils/sendError.js';
import { UserRequest } from '@core/types/userRequest.js';

const changePassHandler = async (request: UserRequest, reply: FastifyReply) => {
	try {
		const userId = request.userId;
		const { oldPassword, newPassword } = request.body as { oldPassword: string, newPassword: string };
		await authService.changePass(userId, oldPassword, newPassword);

		return reply.status(200).send({
			status: 'success',
			message: 'Password has been changed successfully.',
		});


	} catch (error: any) {
		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}
		if (error.code === 'OAUTH_USER') {
			return sendError(reply, 400, error.code, 'This account was created using an OAuth provider.')
		}
		if (error.code === 'INVALID_CREDENTIALS') {
			return sendError(reply, 401, error.code, 'Invalid password', { field: "oldPassword" })
		}
		if (error.code === 'WEAK_PASSWORD') {
			return sendError(reply, 400, error.code, 'Password is too weak', { field: 'newPassword' })
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
	}
}

export default changePassHandler;
