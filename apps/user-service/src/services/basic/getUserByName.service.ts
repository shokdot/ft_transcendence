import prisma from "src/utils/prismaClient.js";

const getUserByName = async (userId: string, username: string) => {
	const user = await prisma.userProfile.findUnique({
		where: { username },
		select: {
			userId: true,
			username: true,
			avatarUrl: true,
			status: true
		}
	});
	if (!user) throw { code: 'USER_NOT_FOUND' };

	return user;
}

export default getUserByName;
