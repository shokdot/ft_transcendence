import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const deleteRequest = async (userId: string, username: string) => {

	const friend = await prisma.userProfile.findUnique({
		where: { username }
	});
	if (!friend) throw new AppError("USER_NOT_FOUND");

	const friendship = await prisma.friendship.findFirst({
		where: {
			OR: [
				{ senderUserId: userId, receiverUserId: friend.userId },
				{ senderUserId: friend.userId, receiverUserId: userId }
			]
		}
	});

	if (!friendship) throw new AppError("FRIENDSHIP_NOT_FOUND");

	await prisma.friendship.delete({
		where: { id: friendship.id }
	});
};

export default deleteRequest;
