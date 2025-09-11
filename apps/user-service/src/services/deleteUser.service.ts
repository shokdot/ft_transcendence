import prisma from "src/utils/prismaClient.js";

const deleteUser = async (userId: string) => {
	const user = await prisma.userProfile.findUnique({
		where: { userId },
	});

	if (!user) throw { code: 'USER_NOT_FOUND' };

	await prisma.userProfile.delete({
		where: { userId },
	});

}

export default deleteUser;
