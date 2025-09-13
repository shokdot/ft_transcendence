import { AppError } from "@core/utils/AppError.js";
import prisma from "src/utils/prismaClient.js";

const acceptRequest = async (receiverId: string, senderUsername: string) => {

	const receiver = await prisma.userProfile.findUnique({
		where: { userId: receiverId }
	});
	if (!receiver) throw new AppError('USER_NOT_FOUND');

	const sender = await prisma.userProfile.findUnique({ where: { username: senderUsername } });
	if (!sender) throw new AppError('USER_NOT_FOUND');

	const friendship = await prisma.friendship.findFirst({
		where: {
			senderUserId: sender.userId,
			receiverUserId: receiver.userId,
			status: 'pending'
		}
	});

	if (!friendship) throw new AppError('FRIEND_REQUEST_NOT_FOUND');

	await prisma.friendship.update({
		where: { id: friendship.id },
		data: { status: 'accepted' }
	});

};

export default acceptRequest;
