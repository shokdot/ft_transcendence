import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const sendRequest = async (senderId: string, receiverUsername: string) => {

	const receiver = await prisma.userProfile.findUnique({ where: { username: receiverUsername } });
	if (!receiver) throw new AppError('RECEIVER_NOT_FOUND');

	if (receiver.userId === senderId) throw new AppError('CANT_SEND_YOURSELF');

	const existing = await prisma.friendship.findFirst({
		where: {
			OR: [
				{ senderUserId: senderId, receiverUserId: receiver.userId },
				{ senderUserId: receiver.userId, receiverUserId: senderId }
			]
		}
	});
	if (existing) throw new AppError('ALREADY_SENT');

	await prisma.friendship.create({
		data: { senderUserId: senderId, receiverUserId: receiver.userId }
	});

};

export default sendRequest;
