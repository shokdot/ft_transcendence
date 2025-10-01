import { FastifyReply } from "fastify";
import { twoFaConfirm } from "@services/twofa/index.js";
import { AuthRequest } from "@core/types/authRequest.js";
import sendError from '@core/utils/sendError.js';
import twoFaDTO from "src/dto/twofa.dto.js";

const twoFaConfirmHandler = async (request: AuthRequest<twoFaDTO>, reply: FastifyReply) => {
	try {
		const { token } = request.body;
		const userId = request.userId;

		await twoFaConfirm({ token, userId });

		reply.status(200).send({
			status: 'success',
			data: { userId },
			message: '2FA enabled successfully'
		});
	}
	catch (error) {
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			case 'NO_TOKEN':
				return sendError(reply, 400, error.code, '2FA token is missing', { field: 'token' });

			case 'NOT_2FA_INITIALIZED':
				return sendError(reply, 400, error.code, '2FA authentication not initialized', { field: 'token' });

			case 'INVALID_2FA_TOKEN':
				return sendError(reply, 400, error.code, '2FA token is invalid', { field: 'token' });

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
}

export default twoFaConfirmHandler;
