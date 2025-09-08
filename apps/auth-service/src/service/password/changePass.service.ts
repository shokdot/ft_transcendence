import prisma from "src/utils/prismaClient.js";
import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';

const changePass = async (userId: string, oldPassword: string, newPassword: string) => {
	const user = await prisma.authUser.findUnique({
		where: { id: userId }
	});

	if (!user) throw { code: 'USER_NOT_FOUND' };

	if (!user.passwordHash) throw { code: 'OAUTH_USER' };

	const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
	if (!isPasswordValid) throw { code: 'INVALID_CREDENTIALS' }

	const passStrength = zxcvbn(newPassword);
	if (passStrength.score < 3) throw { code: 'WEAK_PASSWORD' };

	const hashedPassword = await bcrypt.hash(newPassword, 10);

	await prisma.authUser.update({
		where: { id: userId },
		data: { passwordHash: hashedPassword },
	});

}

export default changePass;
