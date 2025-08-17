import prisma from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import JwtType from '../types/jwtType.js';
import crypto from 'crypto';
import { signJwt } from '../utils/jwt.js';

const loginUser = async ({ email, password }) => {
	email = email.trim().toLowerCase();

	const user = await prisma.authUser.findUnique({
		where: { email },
	});

	if (!user) throw { code: 'NOT_REGISTERED' };

	if (!user.isEmailVerified) throw { code: 'EMAIL_NOT_VERIFIED' };

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
	if (!isPasswordValid) throw { code: 'INVALID_CREDENTIALS' }

	const tokenId = crypto.randomUUID();
	const rawToken = crypto.randomBytes(64).toString('hex');
	const tokenHash = await bcrypt.hash(rawToken, 10);

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 7);

	await prisma.refreshToken.create({
		data: {
			id: tokenId,
			userId: user.id,
			tokenHash,
			expiresAt,
		},
	});

	const accessToken = signJwt({ sub: user.id }, JwtType.ACCESS);
	const refreshToken = signJwt({ sub: user.id, tokenId }, JwtType.REFRESH);

	return { userId: user.id, accessToken, refreshToken };
};

export default loginUser;
