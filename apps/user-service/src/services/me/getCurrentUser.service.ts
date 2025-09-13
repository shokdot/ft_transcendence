import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const getCurrentUser = async (userId: string) => {
	const user = await prisma.userProfile.findUnique({
		where: { userId },
		select: {
			userId: true,
			username: true,
			avatarUrl: true,
			createdAt: true,
			updatedAt: true
		}
	});

	if (!user) throw new AppError('USER_NOT_FOUND');

	return user;
}

export default getCurrentUser;
