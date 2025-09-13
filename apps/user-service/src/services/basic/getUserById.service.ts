import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const getUserById = async (userId: string) => {
	if (!userId) throw new AppError('USER_ID_REQUIRED');

	const user = await prisma.userProfile.findUnique({
		where: { userId },
		select: {
			userId: true,
			username: true,
			avatarUrl: true,
			// preferences: true,
			// metadata: true,
			createdAt: true,
			updatedAt: true
		}
	});

	if (!user) throw new AppError('USER_NOT_FOUND');

	return user;
}

export default getUserById;
