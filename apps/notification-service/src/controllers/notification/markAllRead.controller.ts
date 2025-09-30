import { sendError } from "@core/index.js";
import { AuthRequest } from "@core/types/authRequest.js";
import { FastifyReply } from "fastify";
import { markAllRead } from '@services/notification/index.js'

const markReadHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;

		await markAllRead(userId);
		return reply.status(200).send({
			status: 'success',
			message: 'All notifications marked as read.',
		});

	} catch (error) {
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
};

export default markReadHandler;
