import { FastifyReply } from "fastify";
import { UserRequest } from '@core/types/userRequest.js';
import userService from '../services/users.service.js';
import sendError from "@core/utils/sendError.js";
import { updateUserDto } from "src/dto/updateUser.dto.js";

const updateUserHandler = async (request: UserRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const body: updateUserDto = request.body;
		const data = await userService.updateUser(userId, body);

		reply.status(200).send({
			status: 'success',
			data,
			message: 'User updated successfully'
		});

	}
	catch (error: any) {
		if (error.code === 'NO_FIELDS_PROVIDED') {
			return sendError(reply, 400, error.code, 'No fields provided for update.');
		}
		if (error.code === 'USERNAME_TAKEN') {
			return sendError(reply, 409, error.code, 'The username is already taken.');
		}
		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}
		if (error.code === 'INVALID_AVATAR') {
			return sendError(reply, 400, error.code, 'Avatar must be a valid Base64 image.');
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default updateUserHandler;
