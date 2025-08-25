import JwtType from '../../../../libs/core/src/types/jwtType.js';
import crypto from 'crypto';
import { signJwt } from '../../../../libs/core/src/utils/jwt.js';
import bcrypt from 'bcrypt';
import prisma from './prismaClient.js';

const generateJwtTokens = async (userId: string | undefined) => {
	const tokenId = crypto.randomUUID();
	const rawToken = crypto.randomBytes(64).toString('hex');
	const tokenHash = await bcrypt.hash(rawToken, 10);

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 7);

	await prisma.refreshToken.create({
		data: {
			id: tokenId,
			userId,
			tokenHash,
			expiresAt,
		},
	});

	const accessToken = signJwt({ sub: userId }, JwtType.ACCESS);
	const refreshToken = signJwt({ sub: userId, tokenId }, JwtType.REFRESH);

	return ({ accessToken, refreshToken });

}

export default generateJwtTokens;
