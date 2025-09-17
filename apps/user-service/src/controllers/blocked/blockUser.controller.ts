import { FastifyReply } from "fastify";
import { AuthRequest } from "@core/types/authRequest.js";
import { blockUser } from "src/services/blocked/index.js";
import sendError from "@core/utils/sendError.js";

const blockUserHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const { targetUserId } = request.params as { targetUserId: string };

		await blockUser(userId, targetUserId);

		return reply.status(200).send({
			status: "success",
			message: "User blocked successfully.",
		});
	} catch (error: any) {
		console.log(error);
		if (error.code === 'BLOCK_SELF') {
			return sendError(reply, 400, error.code, 'You cannot block yourself.');
		}
		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}
		if (error.code === 'ALREADY_BLOCKED') {
			return sendError(reply, 400, error.code, 'You have already blocked this user.');
		}

		return sendError(reply, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
	}
};

export default blockUserHandler;
