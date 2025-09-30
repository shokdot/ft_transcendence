import { FastifyReply } from "fastify";
import prisma from '../utils/prismaClient.js'
import { AuthRequest } from "@core/types/authRequest.js";
import { sendError } from "@core/index.js";

const updateLastSeen = async (request: AuthRequest, reply: FastifyReply) => {
	try {
		const userId = request.userId;
		if (!userId) return;

		const nowUtc = new Date();
		const nowYerevan = new Date(
			nowUtc.toLocaleString('en-US', { timeZone: 'Asia/Yerevan' })
		);

		await prisma.userProfile.update({
			where: { userId },
			data: { lastSeen: nowYerevan },
		});

	} catch (error) {
		console.log(error); //change it
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
}


export default updateLastSeen;
