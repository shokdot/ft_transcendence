import { userStatus } from 'src/types/userStatus.js'
import prisma from 'src/utils/prismaClient.js';

const updateUserStatus = async (userId: string, status: userStatus) => {

	if (!status)
		throw { code: 'NO_STATUS_PROVIDED' }

	if (!Object.values(userStatus).includes(status))
		throw { code: 'INVALID_STATUS' }

	try {
		await prisma.userProfile.update({
			where: { userId },
			data: { status },
		});
	} catch (error) {
		if (error.code === 'P2025') {
			throw { code: 'USER_NOT_FOUND' };
		}
	}
}


export default updateUserStatus;
