import { FastifyReply } from "fastify";
import { logoutUser } from "@services/basic/index.js";
import sendError from '@core/utils/sendError.js';
import { AuthRequest } from "@core/types/authRequest.js";

const logoutUserHandler = async (request: AuthRequest, reply: FastifyReply) => {
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
