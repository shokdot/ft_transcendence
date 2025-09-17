import prisma from 'src/utils/prismaClient.js'
import { AppError } from '@core/utils/AppError.js';

const blockUser = async (userId: string, targetUserId: string) => {
	const blocker = await prisma.userProfile.findUnique({ where: { userId } });
	if (!blocker) throw new AppError('USER_NOT_FOUND');

	if (userId === targetUserId) throw new AppError('BLOCK_SELF');

	const target = await prisma.userProfile.findUnique({
		where: { userId: targetUserId },
	});

	if (!target) throw new AppError('USER_NOT_FOUND');

	const existingBlock = await prisma.block.findUnique({
		where: { userId_targetUserId: { userId, targetUserId } },
	});

	if (existingBlock) throw new AppError('ALREADY_BLOCKED');

	await prisma.block.create({
		data: { userId, targetUserId },
	});

}

export default blockUser;
