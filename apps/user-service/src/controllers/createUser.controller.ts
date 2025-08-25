import { FastifyRequest, FastifyReply } from 'fastify';
import createUser from '../services/createUser.service.js';
import sendError from '@core/utils/sendError.js';

const createUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { userId, username } = request.body as { userId: string, username: string };
		await createUser(userId, username);

		reply.status(200).send({
			status: 'success',
			message: 'User created successfully.'
		});

	} catch (error) {
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}

}

export default createUserHandler;
