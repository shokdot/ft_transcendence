import prisma from "src/utils/prismaClient.js";
import { updateUserDTO } from "src/dto/update-user.dto.js";
import { AppError } from "@core/utils/AppError.js";

const updateUser = async (userId: string, data: updateUserDTO) => {

	if (!data || Object.values(data).every(value => value === undefined))
		throw new AppError('NO_FIELDS_PROVIDED');

	const user = await prisma.userProfile.findUnique({ where: { userId } });
	if (!user) throw new AppError('USER_NOT_FOUND');

	if (data.username) {
		const existingUser = await prisma.userProfile.findFirst({ where: { username: data.username } });
		if (existingUser && existingUser.userId !== userId)
			throw new AppError('USERNAME_TAKEN');
	}

	return await prisma.userProfile.update({
		where: { userId },
		data: data,
	});
}

export default updateUser;
