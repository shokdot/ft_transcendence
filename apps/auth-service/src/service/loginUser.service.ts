import { signJwt } from '../utils/jwt.js';
import prisma from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import JwtType from '../types/jwtType.js';

const loginUser = async ({ email, password }) => {
	email = email.trim().toLowerCase();

	const user = await prisma.authUser.findUnique({
		where: { email },
	});

	if (!user) throw { code: 'NOT_REGISTERED' };

	if (!user.isEmailVerified) throw { code: 'EMAIL_NOT_VERIFIED' };

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
	if (!isPasswordValid) throw { code: 'INVALID_CREDENTIALS' }

	const accessToken = signJwt({ sub: user.id, username: user.username }, JwtType.ACCESS);
	const refreshToken = signJwt({ sub: user.id }, JwtType.REFRESH);

	return { userId: user.id, accessToken, refreshToken };
};

export default loginUser;
