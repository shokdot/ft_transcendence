import prisma from "src/utils/prismaClient.js";
import getAvatarUrl from "src/utils/avatar.js";

const createUser = async (userId: string, username: string) => {

	const existingUsername = await prisma.userProfile.findUnique({ where: { username } });
	if (existingUsername) throw { code: 'USERNAME_EXISTS' };

	await prisma.userProfile.create({
		data: {
			userId,
			username,
			avatarUrl: getAvatarUrl()
		}
	});

};

export default createUser;
