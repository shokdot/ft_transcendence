import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";

const verifyUser = async ({ token }) => {

	if (!token) throw new AppError('MISSING_TOKEN');

	const user = await prisma.authUser.findFirst({ where: { verificationToken: token } });

	if (!user) throw new AppError('INVALID_TOKEN');

	await prisma.authUser.update({
		where: { id: user.id },
		data: { isEmailVerified: true, verificationToken: null },
	});
	return;
}

export default verifyUser;
