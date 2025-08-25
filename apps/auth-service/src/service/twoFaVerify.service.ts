import speakeasy from 'speakeasy';
import prisma from "../utils/prismaClient.js";
import JwtType from '@core/types/jwtType.js';
import generateJwtTokens from "../utils/generateJwtTokens.js";
import { verifyJwt } from '@core/utils/jwt.js';

const twoFaVerify = async ({ token, session_token }) => {
	if (!token || !session_token)
		throw ({ code: 'NO_TOKEN' });

	const decoded = verifyJwt(session_token, JwtType.TWO_FA);
	if (!decoded) throw ({ code: 'INVALID_SESSION_TOKEN' });

	const { sub: userId } = decoded;

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

	const tokens = await generateJwtTokens(userId);
	return ({ userId, ...tokens });
}

export default twoFaVerify;
