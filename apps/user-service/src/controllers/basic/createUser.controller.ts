import { FastifyRequest, FastifyReply } from 'fastify';
import { createUserDTO } from 'src/dto/create-user.dto.js';
import { createUser } from '@services/basic/index.js';
import sendError from '@core/utils/sendError.js';

const createUserHandler = async (request: FastifyRequest<{ Body: createUserDTO }>, reply: FastifyReply) => {
	try {
		const { userId, username } = request.body;
		await createUser(userId, username);

		reply.status(201).send({
			status: 'success',
			message: 'User created successfully.'
		});

	} catch (error) {
		switch (error.code) {
			case 'USERNAME_EXISTS':
				return sendError(reply, 409, error.code, 'Username is already taken', { field: 'username' });

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}

}

export default createUserHandler;
