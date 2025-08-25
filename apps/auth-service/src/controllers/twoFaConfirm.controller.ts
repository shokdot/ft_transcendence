import { FastifyReply } from "fastify";
import { UserRequest } from '@core/types/userRequest.js';
import sendError from '@core/utils/sendError.js';
import twoFaBody from "../types/twoFaBody.js";
import twoFaConfirm from "../service/twoFaConfirm.service.js";

const twoFaConfirmHandler = async (request: UserRequest<twoFaBody>, reply: FastifyReply) => {
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
		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}

		if (error.code === 'NO_TOKEN') {
			return sendError(reply, 400, error.code, '2FA token is missing', { field: 'token' });
		}
		if (error.code === 'NOT_2FA_INITIALIZED') {
			return sendError(reply, 400, error.code, '2FA authentication not initialized', { field: 'token' });
		}
		if (error.code === 'INVALID_2FA_TOKEN') {
			return sendError(reply, 400, error.code, '2FA token is invalid', { field: 'token' });
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default twoFaConfirmHandler;
