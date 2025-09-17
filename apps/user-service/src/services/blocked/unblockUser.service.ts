import prisma from 'src/utils/prismaClient.js'
import { AppError } from '@core/utils/AppError.js';

const unblockUser = async (userId: string, targetUserId: string) => {
	const existingBlock = await prisma.block.findUnique({
		where: { userId_targetUserId: { userId, targetUserId } },
	});

	if (!existingBlock) throw new AppError('BLOCK_NOT_FOUND')

	await prisma.block.delete({
		where: { userId_targetUserId: { userId, targetUserId } },
	});
}

export default unblockUser;
