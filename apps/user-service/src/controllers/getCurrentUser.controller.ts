import { FastifyReply } from "fastify";
import { UserRequest } from '@core/types/userRequest.js';
import userService from '../services/users.service.js';
import sendError from "@core/utils/sendError.js";

const getCurrentUserHandler = async (request: UserRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const data = await userService.getCurrentUser(userId);

		reply.status(200).send({
			status: 'success',
			data,
			message: 'User retrieved successfully'
		});
	}
	catch (error: any) {
		if (error.code === 'USER_NOT_FOUND')
			return sendError(reply, 404, error.code, 'The requested user does not exist.');

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default getCurrentUserHandler;
