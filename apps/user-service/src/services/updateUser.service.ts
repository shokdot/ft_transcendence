import prisma from "src/utils/prismaClient.js";
import { updateUserDto } from "src/dto/updateUser.dto.js";

const updateUser = async (userId: string, data: updateUserDto) => {

	if (!data || Object.values(data).every(value => value === undefined))
		throw { code: 'NO_FIELDS_PROVIDED' }

	const user = await prisma.userProfile.findUnique({ where: { userId } });
	if (!user) throw { code: 'USER_NOT_FOUND' };

	if (data.username) {
		const existingUser = await prisma.userProfile.findFirst({ where: { username: data.username } });
		if (existingUser && existingUser.userId !== userId) throw { code: 'USERNAME_TAKEN' };
	}

	return await prisma.userProfile.update({
		where: { userId },
		data: data,
	});
}

export default updateUser;
