import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js';
import { updateAvatar } from '@services/avatar/index.js'
import { updateAvatarDTO } from "src/dto/update-avatar.dto.js";
import sendError from "@core/utils/sendError.js";

const updateAvatarHandler = async (request: AuthRequest<updateAvatarDTO>, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const { avatarUrl } = request.body;

		await updateAvatar(userId, avatarUrl);

		reply.status(200).send({
			status: 'success',
			message: 'Avatar updated successfully.'
		});

	}
	catch (error: any) {
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			case 'INVALID_AVATAR':
				return sendError(reply, 400, error.code, 'Avatar must be a valid Base64 image.');

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
}

export default updateAvatarHandler;
