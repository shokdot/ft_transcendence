import { FastifyReply } from "fastify";
import { AuthRequest } from "@core/types/authRequest.js";
import { unblockUser } from "@services/blocked/index.js";
import sendError from "@core/utils/sendError.js";

const unblockUserHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const { targetUserId } = request.params as { targetUserId: string };

		await unblockUser(userId, targetUserId);

		return reply.status(200).send({
			status: "success",
			message: "User unblocked successfully.",
		});
	} catch (error: any) {
		switch (error.code) {
			case 'BLOCK_NOT_FOUND':
				return sendError(reply, 404, error.code, 'This user is not blocked.');

			default:
				return sendError(reply, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
		}
	}
};

export default unblockUserHandler;
