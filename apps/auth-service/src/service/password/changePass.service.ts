import prisma from "src/utils/prismaClient.js";
import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';
import { AppError } from "@core/utils/AppError.js";

const changePass = async (userId: string, oldPassword: string, newPassword: string) => {
	const user = await prisma.authUser.findUnique({
		where: { id: userId }
	});

	if (!user) throw new AppError('USER_NOT_FOUND');

	if (!user.passwordHash) throw new AppError('OAUTH_USER');

	const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
	if (!isPasswordValid) throw new AppError('INVALID_CREDENTIALS');

	const passStrength = zxcvbn(newPassword);
	if (passStrength.score < 3) throw new AppError('WEAK_PASSWORD');

	const hashedPassword = await bcrypt.hash(newPassword, 10);

	await prisma.authUser.update({
		where: { id: userId },
		data: { passwordHash: hashedPassword },
	});

}

export default changePass;
