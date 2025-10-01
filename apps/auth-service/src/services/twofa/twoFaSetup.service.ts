import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const twoFaSetup = async ({ userId }) => {

	const user = await prisma.authUser.findUnique({ where: { id: userId } });

	if (!user) throw new AppError('USER_NOT_FOUND');

	if (!user.passwordHash) throw new AppError('OAUTH_USER');

	const secret = speakeasy.generateSecret({
		name: `ft_transcendense (${user.email})`
	});

	await prisma.authUser.update({
		where: { id: userId },
		data: { twoFactorSecret: secret.base32 }
	});

	const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

	return { userId: user.id, qrCodeDataURL };
}

export default twoFaSetup;
