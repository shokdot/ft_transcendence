import prisma from "src/utils/prismaClient.js";
import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';

const resetPass = async (token: string, newPassword: string) => {
	const tokenRecord = await prisma.passwordResetToken.findUnique({
		where: { token },
		include: { user: true },
	});

	if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
		throw { code: "INVALID_TOKEN" };
	}

	const passStrength = zxcvbn(newPassword);
	if (passStrength.score < 3) throw { code: 'WEAK_PASSWORD' }

	const hashedPassword = await bcrypt.hash(newPassword, 10);

	await prisma.authUser.update({
		where: { id: tokenRecord.userId },
		data: { passwordHash: hashedPassword },
	});

	await prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });
}

export default resetPass;
