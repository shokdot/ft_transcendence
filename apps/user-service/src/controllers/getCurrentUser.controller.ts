import { FastifyReply } from "fastify";
import { UserRequest } from '@core/types/userRequest.js';
import prisma from '../utils/prismaClient.js';

const getCurrentUserHandler = async (request: UserRequest, reply: FastifyReply) => {
	const { userId } = request;
	console.log(userId);
	// const user = prisma.userProfile.findUnique({ where: { userId } })
	// console.log(user);
	// reply.send({ user });
}

export default getCurrentUserHandler;
