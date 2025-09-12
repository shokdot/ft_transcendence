import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js';
import userService from 'src/services/users.service.js';
import sendError from "@core/utils/sendError.js";
import getAvatarUrl from "src/utils/avatar.js";

const deleteAvatarHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;

		await userService.updateAvatar(userId, getAvatarUrl());

		reply.status(200).send({
			status: 'success',
			message: 'Avatar deleted successfully.'
		});

	}
	catch (error: any) {
		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}
		if (error.code === 'INVALID_AVATAR') {
			return sendError(reply, 400, error.code, 'Avatar must be a valid Base64 image.');
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default deleteAvatarHandler;
