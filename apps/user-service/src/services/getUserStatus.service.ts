import prisma from 'src/utils/prismaClient.js';

const getUserStatus = async (userId: string) => {

	const status = await prisma.userProfile.findUnique({
		where: { userId },
		select: { status: true }
	});

	if (!status)
		throw { code: 'USER_NOT_FOUND' };

	return status;

}


export default getUserStatus;
