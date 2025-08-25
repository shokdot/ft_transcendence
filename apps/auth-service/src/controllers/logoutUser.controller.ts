import { FastifyRequest, FastifyReply } from "fastify";
import sendError from '@core/utils/sendError.js';
import logoutUser from "../service/logoutUser.service.js";

const logoutUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const refreshToken = request.cookies?.refreshToken;
		await logoutUser({ refreshToken });

		reply.clearCookie('refreshToken', {
			path: '/refresh',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
		});

		return reply.status(200).send({
			status: 'success',
			message: 'Logout successful',
		});
	} catch (error) {
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')
	}
}

export default logoutUserHandler;
