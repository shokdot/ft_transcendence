import prisma from "../utils/prismaClient.js";

const twoFaDisable = async ({ userId }) => {

	const user = await prisma.authUser.findUnique({ where: { id: userId } });

	if (!user) throw { code: 'USER_NOT_FOUND' };

	if (!user.twoFactorEnabled) throw { code: '2FA_NOT_ENABLED' };

	await prisma.authUser.update({
		where: { id: userId },
		data: {
			twoFactorEnabled: false,
			twoFactorSecret: null,
		},
	});

	return;
}

export default twoFaDisable;
