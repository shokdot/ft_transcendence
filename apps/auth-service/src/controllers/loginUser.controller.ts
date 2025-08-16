import { FastifyRequest, FastifyReply } from 'fastify';
import LoginBody from '../types/loginBody.js';
import authService from '../service/auth.service.js'
import sendError from '../utils/sendError.js';

const loginUserHandler = async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
	try {
		const { userId, accessToken, refreshToken } = await authService.loginUser(request.body);

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
				accessToken
			},
			message: 'Login successful'
		});
	} catch (error: any) {
		if (error.code === 'INVALID_CREDENTIALS' || error.code === 'NOT_REGISTERED') {
			return sendError(reply, 401, error.code, 'Invalid email or password', { field: "login/password" })
		}
		if (error.code == 'EMAIL_NOT_VERIFIED') {
			return sendError(reply, 403, error.code, 'Email address not verfied', { field: 'email' });
		}
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
	}
}

export default loginUserHandler;
