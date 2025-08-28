import prisma from "src/utils/prismaClient.js";
import { updateUserDto } from "src/dto/updateUser.dto.js";
import { Prisma } from '@prisma/client';
import isBase64Image from "src/utils/isBase64Image.js";

const updateUser = async (userId: string, data: updateUserDto) => {

	if (!data || Object.values(data).every(value => value === undefined))
		throw { code: 'NO_FIELDS_PROVIDED' }

	const user = await prisma.userProfile.findUnique({ where: { userId } });
	if (!user) throw { code: 'USER_NOT_FOUND' };

	if (data.username) {
		const existingUser = await prisma.userProfile.findFirst({ where: { username: data.username } });
		if (existingUser && existingUser.userId !== userId) throw { code: 'USERNAME_TAKEN' };
	}

	if (data.avatarUrl && !isBase64Image(data.avatarUrl)) throw { code: 'INVALID_AVATAR' }

	const updateData = {
		...data,
		preferences: data.preferences ? (data.preferences as Prisma.JsonValue) : undefined,
		metadata: data.metadata ? (data.metadata as Prisma.JsonValue) : undefined,
	};

	return await prisma.userProfile.update({
		where: { userId },
		data: updateData,
	});
}

export default updateUser;
