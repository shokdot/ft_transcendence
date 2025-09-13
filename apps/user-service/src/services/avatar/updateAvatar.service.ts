import isBase64Image from "src/utils/isBase64Image.js";
import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const updateAvatar = async (userId: string, avatarUrl: string) => {
	const user = await prisma.userProfile.findUnique({ where: { userId } });

	if (!user) {
		throw new AppError('USER_NOT_FOUND');
	}

	if (!isBase64Image(avatarUrl)) {
		throw new AppError('INVALID_AVATAR');
	}

	await prisma.userProfile.update({
		where: { userId },
		data: {
			avatarUrl
		}
	});
}

export default updateAvatar;
