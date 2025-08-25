import prisma from "../utils/prismaClient.js";
import getAvatarUrl from "../utils/avatar.js";

const createUser = async (userId: string, username: string) => {
	const user = await prisma.userProfile.create({
		data: {
			userId,
			username,
			avatarUrl: getAvatarUrl()
		}
	});

};

export default createUser;
