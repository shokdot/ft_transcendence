import { FastifyRequest, FastifyReply } from 'fastify';
import RegisterBody from '../types/registerBody.js';
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

export default registerUserHandler;
