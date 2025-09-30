import prisma from "src/utils/prismaClient.js";
import { notificationSockets } from "../socket/socketInstances.service.js";

const createNotification = async (userId: string, type: string, message: string) => {

	const notification = await prisma.notification.create({
		data: {
			userId,
			type,
			message
		},
		select: {
			id: true,
			type: true,
			message: true,
			isRead: true,
			createdAt: true,
		},
	});

	notificationSockets.send(userId, {
		id: notification.id,
		type: notification.type,
		message: notification.message,
		createdAt: notification.createdAt,
	});

};

export default createNotification;
