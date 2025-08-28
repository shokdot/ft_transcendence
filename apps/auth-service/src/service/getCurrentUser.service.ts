import prisma from "../utils/prismaClient.js";

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

	if (!user) throw ({ code: 'USER_NOT_FOUND' });

	const { id, ...rest } = user;
	return { userId: id, ...rest };
}

export default getCurrentUser;
