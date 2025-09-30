import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js'
import { deleteNotification } from '@services/notification/index.js';
import { sendError } from "@core/index.js";

const deleteNotificationHandler = async (request: AuthRequest<undefined, undefined, { id: string }>, reply: FastifyReply) => {
	try {
		const { id } = request.params;
		const { userId } = request;

		await deleteNotification(id, userId);

		return reply.status(200).send({
			status: 'success',
			message: 'Notification successfuly deleted.',
		});

	} catch (error) {
		switch (error.code) {
			case 'NOT_FOUND':
				return sendError(reply, 404, error.code, 'Not found notification with given id and userId');
			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
};

export default deleteNotificationHandler;
