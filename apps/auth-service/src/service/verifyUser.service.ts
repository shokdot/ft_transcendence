import prisma from '../utils/prisma.js';

const verifyUser = async ({ token }) => {

	if (!token) throw { code: 'MISSING_TOKEN' };

	const user = await prisma.authUser.findFirst({ where: { verificationToken: token } });

	if (!user) throw { code: 'INVALID_TOKEN' }

	await prisma.authUser.update({
		where: { id: user.id },
		data: { isEmailVerified: true, verificationToken: null },
	});
	return;
}

export default verifyUser;
