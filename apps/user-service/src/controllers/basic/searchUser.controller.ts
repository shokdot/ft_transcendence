import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js';
import { searchUser } from '@services/basic/index.js';
import sendError from "@core/utils/sendError.js";

const searchUserHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request.params as { userId: string }; // fix this 
		const { query } = request.query as { query: string }; // fix this

		const data = await searchUser(userId, query);

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
