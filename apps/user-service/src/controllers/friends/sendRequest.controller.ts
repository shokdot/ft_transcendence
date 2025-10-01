import { FastifyReply } from "fastify";
import { sendRequestDTO } from "src/dto/send-friend-request.dto.js";
import { sendRequest } from "@services/friends/index.js"
import { AuthRequest } from "@core/types/authRequest.js";
import { sendError } from "@core/index.js";


const sendRequestHandler = async (request: AuthRequest<undefined, undefined, sendRequestDTO>, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const { username } = request.params;

		await sendRequest(userId, username);

		return reply.status(200).send({
			status: 'success',
			message: 'Friend request successfully sent.'
		});

	} catch (error) {
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');
			case 'CANT_SEND_YOURSELF':
				return sendError(reply, 400, error.code, 'You cannot send a request to yourself.');
			case 'ALREADY_SENT':
				return sendError(reply, 409, error.code, 'A request already exists between these users.');

			default:
				return sendError(reply, 400, error.code, 'Bad request.');
		}
	}
};

export default sendRequestHandler;
