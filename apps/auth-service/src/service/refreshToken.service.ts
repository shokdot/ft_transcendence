import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { verifyJwt, signJwt } from '../utils/jwt.js';
import JwtType from "../types/jwtType.js";
import prisma from '../utils/prisma.js';

const refreshToken = async ({ refreshToken }) => {

	if (!refreshToken) {
		throw ({ code: 'REFRESH_TOKEN_MISSING' })
	}

	const decoded = verifyJwt(refreshToken, JwtType.REFRESH);
	if (!decoded) {
		throw ({ code: 'INVALID_REFRESH_TOKEN' })
	}

	const { sub: userId, tokenId } = decoded;

	const tokenRecord = await prisma.refreshToken.findUnique({ where: { id: tokenId } });

	if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
		throw ({ code: 'INVALID_REFRESH_TOKEN' })
	}

	await prisma.refreshToken.update({
		where: { id: tokenId },
		data: { revoked: true },
	});

	const accessToken = signJwt({ sub: decoded.sub }, JwtType.ACCESS);

	const newTokenId = crypto.randomUUID();
	const rawToken = crypto.randomBytes(64).toString('hex');
	const tokenHash = await bcrypt.hash(rawToken, 10);
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 7);

	await prisma.refreshToken.create({
		data: { id: newTokenId, userId, tokenHash, expiresAt },
	});

	const newRefreshToken = signJwt({ sub: userId, tokenId: newTokenId }, JwtType.REFRESH);

	return ({ userId: decoded.sub, accessToken, newRefreshToken });

}

export default refreshToken;
