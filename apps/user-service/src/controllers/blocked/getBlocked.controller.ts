import { FastifyReply } from "fastify";
import { AuthRequest } from "@core/types/authRequest.js";
import { getBlocked } from "@services/blocked/index.js";
import sendError from "@core/utils/sendError.js";

const getBlockedHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;

		const data = await getBlocked(userId);

		return reply.status(200).send({
			status: 'success',
			data,
			message: data.count > 0 ? 'Blocked users retrieved successfully.' : 'You have not blocked any users yet.'
		});
	} catch (error: any) {
		return sendError(reply, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
	}
};

export default getBlockedHandler;
