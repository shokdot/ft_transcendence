import { FastifyReply } from "fastify";
import { AuthRequest } from "@core/types/authRequest.js";
import { twoFaVerify } from "@services/twofa/index.js";
import sendError from '@core/utils/sendError.js';
import twoFaDTO from "src/dto/twofa.dto.js";

const twoFaVerifyHandler = async (request: AuthRequest<twoFaDTO>, reply: FastifyReply) => {
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
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			case 'INVALID_SESSION_TOKEN':
				return sendError(reply, 400, error.code, '2FA session_token is invalid', { field: 'session_token' });

			case 'NO_TOKEN':
				return sendError(reply, 400, error.code, '2FA token or session token is missing', { field: 'token/session_token' });

			case 'NOT_2FA_INITIALIZED':
				return sendError(reply, 400, error.code, '2FA authentication not initialized', { field: 'token' });

			case 'INVALID_2FA_TOKEN':
				return sendError(reply, 400, error.code, '2FA token is invalid', { field: 'token' });

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
}

export default twoFaVerifyHandler;
