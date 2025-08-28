import { FastifyRequest, FastifyReply } from 'fastify';
import { createUserDto } from 'src/dto/createUser.dto.js';
import userService from 'src/services/users.service.js';
import sendError from '@core/utils/sendError.js';

const createUserHandler = async (request: FastifyRequest<{ Body: createUserDto }>, reply: FastifyReply) => {
	try {
		const { userId, username } = request.body;
		await userService.createUser(userId, username);

		reply.status(201).send({
			status: 'success',
			message: 'User created successfully.'
		});

	} catch (error) {
		if (error.code === 'USERNAME_EXISTS') {
			return sendError(reply, 409, error.code, 'Username is already taken', { field: 'username' })
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}

}

export default createUserHandler;
