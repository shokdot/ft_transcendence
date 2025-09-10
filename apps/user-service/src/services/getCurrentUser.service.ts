import prisma from "src/utils/prismaClient.js";

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

	if (!user) throw { code: 'USER_NOT_FOUND' };

	return user;

}

export default getCurrentUser;
