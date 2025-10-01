import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js';
import { deleteUser } from '@services/me/index.js';
import sendError from "@core/utils/sendError.js";

const deleteUserHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;
		await deleteUser(userId);

		return reply.status(200).send({
			status: 'success',
			message: 'User deleted successfully',
		});
	}
	catch (error: any) {
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
};

export default deleteUserHandler;
