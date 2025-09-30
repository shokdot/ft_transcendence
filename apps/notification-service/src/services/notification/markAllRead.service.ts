import prisma from "src/utils/prismaClient.js";

const markAllRead = async (userId: string) => {

	await prisma.notification.updateMany({
		where: { userId, isRead: false },
		data: { isRead: true }
	});

}

export default markAllRead;
