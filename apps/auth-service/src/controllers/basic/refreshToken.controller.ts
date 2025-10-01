import { FastifyRequest, FastifyReply } from 'fastify';
import sendError from '@core/utils/sendError.js';
import { refreshToken as refreshTokenService } from '@services/basic/index.js'

const refreshTokenHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const refreshToken = request.cookies?.refreshToken;

		const { userId, accessToken, refreshToken: newRefreshToken } = await refreshTokenService({ refreshToken });

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
		switch (error.code) {
			case 'REFRESH_TOKEN_MISSING':
				return sendError(reply, 401, error.code, 'No refresh token provided', { field: 'refreshToken' });

			case 'INVALID_REFRESH_TOKEN':
				return sendError(reply, 403, error.code, 'Invalid or expired refresh token', { field: 'refreshToken' });

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
}

export default refreshTokenHandler;
