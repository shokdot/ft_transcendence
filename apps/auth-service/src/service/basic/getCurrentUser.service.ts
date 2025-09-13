import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const getCurrentUser = async ({ userId }) => {
	const user = await prisma.authUser.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			isEmailVerified: true,
			createdAt: true,
			updatedAt: true
		}
	});

	if (!user) throw new AppError('USER_NOT_FOUND');

	const { id, ...rest } = user;
	return { userId: id, ...rest };
}

export default getCurrentUser;
