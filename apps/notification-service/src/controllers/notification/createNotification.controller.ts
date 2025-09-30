import { FastifyReply } from "fastify";
import { AuthRequest } from "@core/types/authRequest.js";
import { createNotification } from '@services/notification/index.js'
import { sendError } from "@core/index.js";
import createNotificationDTO from "src/dto/create-notification.dto.js";

const createNotifcationHandler = async (request: AuthRequest<createNotificationDTO>, reply: FastifyReply) => {
	try {
		const { userId, type, message } = request.body; //zod ?

		await createNotification(userId, type, message);

		return reply.status(200).send({
			status: 'success',
			message: 'Notification successfuly created.',
		});

	} catch (error) {
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default createNotifcationHandler;
