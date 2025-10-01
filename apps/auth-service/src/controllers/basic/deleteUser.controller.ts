import { FastifyReply } from "fastify";
import { deleteUser } from "@services/basic/index.js";
import sendError from '@core/utils/sendError.js';
import { AuthRequest } from "@core/types/authRequest.js";

const deleteUserHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId, accessToken } = request;
		await deleteUser(userId, accessToken);

		return reply.status(200).send({
			status: 'success',
			message: 'User deleted successfully',
		});

	} catch (error) {
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');
			case 'USER_SERVICE_ERROR':
				return sendError(reply, 503, error.coded, 'Failed to communicate with user service.')

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
		}
	}
}

export default deleteUserHandler;
