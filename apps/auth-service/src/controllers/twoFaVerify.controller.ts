import { FastifyReply } from "fastify";
import sendError from "../utils/sendError.js";
import { UserRequest } from "../types/userRequest.js";
import twoFaBody from "../types/twoFaBody.js";
import twoFaVerify from "../service/twoFaVerify.service.js";

const twoFaVerifyHandler = async (request: UserRequest<twoFaBody>, reply: FastifyReply) => {
	try {
		const { token, session_token } = request.body;

		const { userId, accessToken, refreshToken } = await twoFaVerify({ token, session_token });

		reply.setCookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			path: '/refresh',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60
		});

		return reply.status(200).send({
			status: 'success',
			data: {
				userId,
				accessToken,
				tokenType: 'Bearer',
				expiresIn: 900
			},
			message: 'Login successful'
		});

	} catch (error) {

		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}
		if (error.code === 'INVALID_SESSION_TOKEN') {
			return sendError(reply, 400, error.code, '2FA session_token is invalid', { field: 'session_token' });
		}
		if (error.code === 'NO_TOKEN') {
			return sendError(reply, 400, error.code, '2FA token or session token is missing', { field: 'token/session_token' });
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

export default twoFaVerifyHandler;
