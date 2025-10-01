import { FastifyReply } from 'fastify';
import { changePass } from '@services/password/index.js'
import { AuthRequest } from '@core/types/authRequest.js';
import sendError from '@core/utils/sendError.js';
import changePasswordDTO from 'src/dto/change-password.dto.js';

const changePassHandler = async (request: AuthRequest<changePasswordDTO>, reply: FastifyReply) => {
	try {
		const userId = request.userId;
		const { oldPassword, newPassword } = request.body;
		await changePass(userId, oldPassword, newPassword);

		return reply.status(200).send({
			status: 'success',
			message: 'Password has been changed successfully.',
		});


	} catch (error: any) {
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			case 'OAUTH_USER':
				return sendError(reply, 400, error.code, 'This account was created using an OAuth provider.');

			case 'INVALID_CREDENTIALS':
				return sendError(reply, 401, error.code, 'Invalid password', { field: "oldPassword" });

			case 'WEAK_PASSWORD':
				return sendError(reply, 400, error.code, 'Password is too weak', { field: 'newPassword' });

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
}

export default changePassHandler;
