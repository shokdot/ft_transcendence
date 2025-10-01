import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js';
import { updateUser } from '@services/me/index.js';
import sendError from "@core/utils/sendError.js";
import { updateUserDTO } from "src/dto/update-user.dto.js";

const updateUserHandler = async (request: AuthRequest<updateUserDTO>, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const body = request.body;
		const data = await updateUser(userId, body);

		reply.status(200).send({
			status: 'success',
			data,
			message: 'User updated successfully'
		});

	}
	catch (error: any) {
		switch (error.code) {
			case 'NO_FIELDS_PROVIDED':
				return sendError(reply, 400, error.code, 'No fields provided for update.');

			case 'USERNAME_TAKEN':
				return sendError(reply, 409, error.code, 'The username is already taken.');

			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
}

export default updateUserHandler;
