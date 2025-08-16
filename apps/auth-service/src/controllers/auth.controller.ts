import { FastifyRequest, FastifyReply } from 'fastify';
import RegisterBody from '../types/registerBody.js';
import LoginBody from '../types/loginBody.js';
import authService from '../service/auth.service.js'
import sendError from '../utils/sendError.js';


const registerUserHandler = async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
	try {
		const { body } = request;
		const user = await authService.registerUser(body);
		return reply.status(201).send({
			status: 'success',
			data: {
				userId: user.id,
				email: user.email,
				username: user.username
			},
			message: 'User registered successfully'

		});
	} catch (error: any) {
		if (error.code === 'EMAIL_EXISTS') {
			return sendError(reply, 409, error.code, 'Email is already registered', { field: 'email' })
		}
		if (error.code === 'USERNAME_EXISTS') {
			return sendError(reply, 409, error.code, 'Username is already taken', { field: 'username' })
		}
		if (error.code == 'WEAK_PASSWORD') {
			return sendError(reply, 400, error.code, 'Password is too weak', { field: 'password' })
		}
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
	}
}


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


export default { registerUserHandler, loginUserHandler }
