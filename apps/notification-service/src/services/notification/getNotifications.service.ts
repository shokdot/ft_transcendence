import prisma from "src/utils/prismaClient.js";

const getNotifications = async (userId: string) => {
	const results = await prisma.notification.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
	});

	return { count: results.length, results };
};

export default getNotifications;
