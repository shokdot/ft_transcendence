import { FastifyReply } from "fastify";
import sendError from '@core/utils/sendError.js';
import logoutUser from "../service/logoutUser.service.js";
import { UserRequest } from "@core/types/userRequest.js";

const logoutUserHandler = async (request: UserRequest, reply: FastifyReply) => {
	try {
		const accessToken = request.accessToken;
		const refreshToken = request.cookies?.refreshToken;
		await logoutUser({ accessToken, refreshToken });

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
