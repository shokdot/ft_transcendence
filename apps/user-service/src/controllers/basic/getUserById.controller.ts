import { FastifyReply, FastifyRequest } from "fastify";
import { getUserById } from '@services/basic/index.js';
import { userByIdDTO } from "src/dto/user-by-id.dto.js";
import sendError from "@core/utils/sendError.js";

const getUserByIdHandler = async (request: FastifyRequest<{ Params: userByIdDTO }>, reply: FastifyReply) => {
	try {
		const { userId } = request.params;
		const data = await getUserById(userId);

		reply.status(200).send({
			status: 'success',
			data,
			message: 'User retrieved successfully'
		});

	}
	catch (error: any) {
		switch (error.code) {
			case 'USER_ID_REQUIRED':
				return sendError(reply, 400, error.code, 'Parameter "userId" is required.', { field: 'userId' });

			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
}

export default getUserByIdHandler;
