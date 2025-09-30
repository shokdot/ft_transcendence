import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js'
import { getNotifications } from '@services/notification/index.js'
import { sendError } from "@core/index.js";

const getNotificationsHandler = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const data = await getNotifications(userId);

		return reply.status(200).send({
			status: 'success',
			data,
			message: data.count > 0 ? "Notifications retrieved successfully" : "No notifications found"
		});

	} catch (error) {
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
};

export default getNotificationsHandler;
