import { FastifyRequest, FastifyReply } from 'fastify';
import authService from '../service/auth.service.js'
import sendError from '../utils/sendError.js';

const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const refreshToken = request.cookies?.refreshToken;

		const { userId, accessToken, newRefreshToken } = await authService.refreshToken({ refreshToken });

		reply.setCookie('refreshToken', newRefreshToken, {
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
			message: 'Token refreshed successfully'
		})

	}
	catch (error: any) {

		if (error.code === 'REFRESH_TOKEN_MISSING') {
			return sendError(reply, 401, error.code, 'No refresh token provided', { field: 'refreshToken' });
		}

		if (error.code === 'INVALID_REFRESH_TOKEN') {
			return sendError(reply, 403, error.code, 'Invalid or expired refresh token', { field: 'refreshToken' });
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
	}
}

export default refreshToken;
