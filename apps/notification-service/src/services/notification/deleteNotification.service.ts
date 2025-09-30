import { AppError } from "@core/utils/AppError.js";
import prisma from "src/utils/prismaClient.js";

const deleteNotification = async (id: string, userId: string) => {
	const notification = await prisma.notification.findFirst({
		where: { id, userId },
		select: { id: true }
	});

	if (!notification) throw new AppError('NOT_FOUND');

	await prisma.notification.delete({
		where: { id }
	})
};

export default deleteNotification;
