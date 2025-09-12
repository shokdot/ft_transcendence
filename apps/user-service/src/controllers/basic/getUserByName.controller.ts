import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js';
import { getUserByName } from 'src/services/basic/index.js';
import sendError from "@core/utils/sendError.js";

const getUserByNameHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request.params as { userId: string }; // fix this
		const { username } = request.params as { username: string }; // fix this

		const data = await getUserByName(userId, username);

		reply.status(200).send({
			status: 'success',
			data,
			message: 'Users found successfully'
		});

	}
	catch (error: any) {
		if (error.code === 'USER_NOT_FOUND')
			return sendError(reply, 404, error.code, 'The requested user does not exist.');

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default getUserByNameHandler;
