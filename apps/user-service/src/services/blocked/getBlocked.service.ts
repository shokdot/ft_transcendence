import prisma from 'src/utils/prismaClient.js'

const getBlocked = async (userId: string) => {
	const blocked = await prisma.block.findMany({
		where: { userId },
		include: {
			targetUser: {
				select: {
					userId: true,
					username: true,
					avatarUrl: true,
					status: true,
				},
			},
		},
	});

	const data = blocked.map((b) => b.targetUser);
	return { blocked: data, count: data.length };
}

export default getBlocked;
