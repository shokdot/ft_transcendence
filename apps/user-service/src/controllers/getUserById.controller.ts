import { FastifyReply, FastifyRequest } from "fastify";
import sendError from "@core/utils/sendError.js";
import userService from 'src/services/users.service.js';
import { userByIdParamDto } from "src/dto/userByIdParam.dto.js";

const getUserByIdHandler = async (request: FastifyRequest<{ Params: userByIdParamDto }>, reply: FastifyReply) => {
	try {
		const { userId } = request.params;
		const data = await userService.getUserById(userId);

		reply.status(200).send({
			status: 'success',
			data,
			message: 'User retrieved successfully'
		});

	}
	catch (error: any) {
		if (error.code === 'USER_ID_REQUIRED')
			return sendError(reply, 400, error.code, 'Parameter "userId" is required.', { field: 'userId' });

		if (error.code === 'USER_NOT_FOUND')
			return sendError(reply, 404, error.code, 'The requested user does not exist.');

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default getUserByIdHandler;
