import { FastifyReply } from "fastify";
import { UserRequest } from '@core/types/userRequest.js';
import userService from 'src/services/users.service.js';
import sendError from "@core/utils/sendError.js";

const searchUserHandler = async (request: UserRequest, reply: FastifyReply) => {
	try {
		const { userId } = request.params as { userId: string };
		const { query } = request.query as { query: string };

		const data = await userService.searchUser(userId, query);

		reply.status(200).send({
			status: 'success',
			data,
			message: data.count > 0 ? 'Users found successfully' : 'No users found'
		});

	}
	catch (error: any) {
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default searchUserHandler;
