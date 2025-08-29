import { FastifyReply } from "fastify";
import { UserRequest } from '@core/types/userRequest.js';
import userService from 'src/services/users.service.js';
import sendError from "@core/utils/sendError.js";
import { UpdateStatusDto } from "src/dto/updateStatus.dto.js";
import { userStatus } from 'src/types/userStatus.js';

const updateStatusHandler = async (request: UserRequest<UpdateStatusDto>, reply: FastifyReply) => {
	try {
		const { userId } = request;
		const { status } = request.body;

		await userService.updateUserStatus(userId, status as userStatus);

		reply.status(200).send({
			status: 'success',
			message: 'User status updated successfully'
		});

	}
	catch (error: any) {
		if (error.code === 'NO_STATUS_PROVIDED') {
			return sendError(reply, 400, error.code, 'No status provided for update.', { field: 'status' });
		}
		if (error.code === 'INVALID_STATUS') {
			return sendError(reply, 400, error.code, 'Invalid status provided for update.', { field: 'status' });
		}
		if (error.code === 'USER_NOT_FOUND') {
			return sendError(reply, 404, error.code, 'The requested user does not exist.');
		}

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}

export default updateStatusHandler;
