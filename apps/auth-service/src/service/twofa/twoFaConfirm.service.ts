import prisma from "src/utils/prismaClient.js";
import speakeasy from 'speakeasy';

const twoFaConfirm = async ({ token, userId }) => {
	if (!token)
		throw ({ code: 'NO_TOKEN' });

	const user = await prisma.authUser.findUnique({ where: { id: userId } });

	if (!user) {
		throw ({ code: 'USER_NOT_FOUND' });
	}

	if (!user.twoFactorSecret) {
		throw ({ code: 'NOT_2FA_INITIALIZED' });
	}

	const verified = speakeasy.totp.verify({
		secret: user.twoFactorSecret,
		encoding: 'base32',
		token,
		window: 1
	});

	if (!verified) {
		throw ({ code: 'INVALID_2FA_TOKEN' });
	}

	await prisma.authUser.update({
		where: { id: user.id },
		data: { twoFactorEnabled: true }
	});

	return;
}

export default twoFaConfirm;
