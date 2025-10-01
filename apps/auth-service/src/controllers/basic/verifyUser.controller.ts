import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyUser } from '@services/basic/index.js'
import sendError from '@core/utils/sendError.js';
import verifyUserQuery from 'src/dto/verify-user.dto.js';

const verifyUserHandler = async (request: FastifyRequest<{ Querystring: verifyUserQuery }>, reply: FastifyReply) => {
	const { token } = request.query;
	try {
		await verifyUser({ token });
		return reply.status(200).send({
			status: 'success',
			message: 'Email verified successfully. You can now log in.',
		});

	} catch (error: any) {
		switch (error.code) {
			case 'MISSING_TOKEN':
				return sendError(reply, 400, error.code, 'Verification token is required', { field: 'token' });

			case 'INVALID_TOKEN':
				return sendError(reply, 400, error.code, 'Invalid or expired verification token', { field: 'token' });

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
};

export default verifyUserHandler;
