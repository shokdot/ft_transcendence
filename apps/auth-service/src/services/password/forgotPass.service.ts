import prisma from "src/utils/prismaClient.js";
import crypto from "crypto";
import { sendResetEmail } from "src/utils/email.js";
import { AppError } from "@core/utils/AppError.js";

const forgotPass = async (email: string) => {

	const user = await prisma.authUser.findUnique({ where: { email } });
	if (!user) throw new AppError('USER_NOT_FOUND');

	if (!user.passwordHash) throw new AppError('OAUTH_USER');

	const token = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

	await prisma.passwordResetToken.create({
		data: {
			userId: user.id,
			token,
			expiresAt,
		},
	});

	await sendResetEmail(email, token);

}

export default forgotPass;
