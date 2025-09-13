import prisma from "src/utils/prismaClient.js";

const listFriends = async (userId: string, status?: string) => {
	const statusFilter = status ? { in: [status] } : undefined;

	const friendships = await prisma.friendship.findMany({
		where: {
			OR: [
				{ senderUserId: userId, ...(statusFilter && { status: statusFilter }) },
				{ receiverUserId: userId, ...(statusFilter && { status: statusFilter }) }
			]
		},
		select: {
			status: true,
			sender: { select: { userId: true, username: true } },
			receiver: { select: { userId: true, username: true } },
			senderUserId: true,
			receiverUserId: true
		}
	});

	const friends = friendships.map(f => {
		const friend = f.senderUserId === userId ? f.receiver : f.sender;
		return {
			userId: friend.userId,
			username: friend.username,
			status: f.status
		};
	});

	return {
		friends,
		count: friends.length
	};
};

export default listFriends;
