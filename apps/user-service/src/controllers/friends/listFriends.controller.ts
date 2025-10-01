import { FastifyReply } from "fastify";
import { AuthRequest } from "@core/types/authRequest.js";
import { sendError } from "@core/index.js";
import { listFriends } from '@services/friends/index.js'


const listFriendsHandler = async (requst: AuthRequest<undefined, { status?: string }>, reply: FastifyReply) => {
	try {
		const { userId } = requst;
		const { status } = requst.query;
		const data = await listFriends(userId, status);

		return reply.status(200).send({
			status: 'success',
			data,
			message: 'Users found successfully' // change
		});

	} catch (error) {
		switch (error.code) {
			case 'USER_NOT_FOUND':
				return sendError(reply, 404, error.code, 'The requested user does not exist.');

			default:
				return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
		}
	}
};

export default listFriendsHandler;
