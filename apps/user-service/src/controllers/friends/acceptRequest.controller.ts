import { AuthRequest } from "@core/types/authRequest.js";
import { FastifyReply } from "fastify";
import { acceptRequestDTO } from "src/dto/accept-friend-request.dto.js";
import { acceptRequest } from 'src/services/friends/index.js'
import { sendError } from "@core/index.js";

const acceptRequestHandler = async (request: AuthRequest<undefined, undefined, acceptRequestDTO>, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const { username } = request.params;

		await acceptRequest(userId, username);

		return reply.status(200).send({
			status: 'success',
			message: 'Friend request accepted.'
		});

	} catch (error) {
		switch (error.code) {
			case "USER_NOT_FOUND":
				return sendError(reply, 404, error.code, "User not found");

			case "FRIEND_REQUEST_NOT_FOUND":
				return sendError(reply, 404, error.code, "Friend request not found");
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}
export default acceptRequestHandler;
