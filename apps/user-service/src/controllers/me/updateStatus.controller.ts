import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js';
import { updateUserStatus } from '@services/me/index.js';
import { updateStatusDTO } from "src/dto/update-status.dto.js";
import { userStatus } from 'src/types/userStatus.js';
import sendError from "@core/utils/sendError.js";

const updateStatusHandler = async (request: AuthRequest<updateStatusDTO>, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const { status } = request.body;

		await updateUserStatus(userId, status as userStatus);

		reply.status(200).send({
			status: 'success',
			message: 'User status updated successfully'
		});

	}
	catch (error: any) {
		switch (error.code) {
			case 'NO_STATUS_PROVIDED':
				return sendError(reply, 400, error.code, 'No status provided for update.', { field: 'status' });

			case 'INVALID_STATUS':
				return sendError(reply, 400, error.code, 'Invalid status provided for update.', { field: 'status' });

			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
}

export default updateStatusHandler;
