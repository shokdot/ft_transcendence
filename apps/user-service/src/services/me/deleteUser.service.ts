import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const deleteUser = async (userId: string) => {
	const user = await prisma.userProfile.findUnique({
		where: { userId },
	});

	if (!user) throw new AppError('USER_NOT_FOUND');

	await prisma.userProfile.delete({
		where: { userId },
	});
}

export default deleteUser;
