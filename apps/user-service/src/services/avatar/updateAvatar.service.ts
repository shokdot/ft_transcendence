import isBase64Image from "src/utils/isBase64Image.js";
import prisma from "src/utils/prismaClient.js";

const updateAvatar = async (userId: string, avatarUrl: string) => {
	const user = await prisma.userProfile.findUnique({ where: { userId } });

	if (!user) {
		throw { code: 'USER_NOT_FOUND' };
	}

	if (!isBase64Image(avatarUrl)) {
		throw { code: 'INVALID_AVATAR' }
	}

	await prisma.userProfile.update({
		where: { userId },
		data: {
			avatarUrl
		}
	})
}

export default updateAvatar;
