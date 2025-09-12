import prisma from "src/utils/prismaClient.js";

const searchUser = async (userId: string, query: string) => {

	// if (blcoked delete users)

	const users = await prisma.userProfile.findMany({
		where: {
			username: {
				contains: query.toLowerCase(),
			},
			NOT: { userId },
		},
		select: {
			userId: true,
			username: true,
			avatarUrl: true,
			status: true,
		},
	});


	return {
		query,
		count: users.length,
		results: users,
	}
}

export default searchUser;
