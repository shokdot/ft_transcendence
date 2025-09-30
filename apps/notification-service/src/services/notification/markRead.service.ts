import { AppError } from "@core/utils/AppError.js";
import prisma from "src/utils/prismaClient.js";

const markRead = async (id: string, userId: string) => {

	const notification = await prisma.notification.findFirst({
		where: { id, userId },
		select: { id: true }
	});

	if (!notification) throw new AppError('NOT_FOUND');

	await prisma.notification.update({
		where: { id },
		data: { isRead: true }
	});

};

export default markRead;
