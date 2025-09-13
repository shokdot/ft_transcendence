import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const twoFaDisable = async ({ userId }) => {

	const user = await prisma.authUser.findUnique({ where: { id: userId } });

	if (!user) throw new AppError('USER_NOT_FOUND');

	if (!user.twoFactorEnabled) throw new AppError('2FA_NOT_ENABLED');

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
