import { FastifyRequest, FastifyReply } from 'fastify';
import authService from '../service/auth.service.js'
import sendError from '../utils/sendError.js';
import verifyUserQuery from '../types/verrifyUserQuery.js';

const verifyUserHandler = async (request: FastifyRequest<{ Querystring: verifyUserQuery }>, reply: FastifyReply) => {
	const { token } = request.query;
	try {
		await authService.verifyUser({ token });
		return reply.status(200).send({
			status: 'success',
			message: 'Email verified successfully. You can now log in.',
		});

	} catch (error: any) {
		if (error.code === 'MISSING_TOKEN') {
			return sendError(reply, 400, error.code, 'Verification token is required', { field: 'token' });
		}
		if (error.code === 'INVALID_TOKEN') {
			return sendError(reply, 400, error.code, 'Invalid or expired verification token', { field: 'token' });
		}
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
	}
};

export default verifyUserHandler;
