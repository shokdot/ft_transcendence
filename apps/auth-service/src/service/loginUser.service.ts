import bcrypt from 'bcrypt';
import prisma from '../utils/prisma.js';
import generateJwtTokens from '../utils/generateJwtTokens.js';
import { signJwt } from '../utils/jwt.js';
import JwtType from '../types/jwtType.js';

const loginUser = async ({ email, password }): Promise<any> => {
	email = email.trim().toLowerCase();

	const user = await prisma.authUser.findUnique({
		where: { email },
	});

	if (!user) throw { code: 'NOT_REGISTERED' };

	if (!user.isEmailVerified) throw { code: 'EMAIL_NOT_VERIFIED' };

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
	if (!isPasswordValid) throw { code: 'INVALID_CREDENTIALS' }

	if (user.twoFactorEnabled) {
		const payload = { sub: user.id, stage: "2FA" };
		return { userId: user.id, twoFactorRequired: true, twoFaToken: signJwt(payload, JwtType.TWO_FA) };
	}

	const tokens = await generateJwtTokens(user.id);

	return { userId: user.id, ...tokens };
};

export default loginUser;
