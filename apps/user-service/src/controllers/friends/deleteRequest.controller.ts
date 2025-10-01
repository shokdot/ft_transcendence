import { FastifyReply } from "fastify";
import { AuthRequest } from "@core/types/authRequest.js";
import { sendError } from "@core/index.js";
import { deleteRequest } from '@services/friends/index.js'
import { deleteRequestDTO } from "src/dto/delete-friend-request.dto.js";

const deleteRequestHandler = async (request: AuthRequest<undefined, undefined, deleteRequestDTO>, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const { username } = request.params;

		await deleteRequest(userId, username);

		return reply.status(200).send({
			status: 'success',
			message: 'Friend removed or request rejected successfully'
		});

	} catch (error) {
		switch (error.code) {
			case "USER_NOT_FOUND":
				return sendError(reply, 404, error.code, "User not found");

			case "FRIENDSHIP_NOT_FOUND":
				return sendError(reply, 404, error.code, "Friendship not found");

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}

	}
};

export default deleteRequestHandler;
