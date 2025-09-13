import speakeasy from 'speakeasy';
import prisma from "src/utils/prismaClient.js";
import generateJwtTokens from "src/utils/generateJwtTokens.js";
import JwtType from '@core/types/jwtType.js';
import { verifyJwt } from '@core/utils/jwt.js';
import { AppError } from "@core/utils/AppError.js";

const twoFaVerify = async ({ token, session_token }) => {
	if (!token || !session_token)
		throw new AppError('NO_TOKEN');

	const decoded = verifyJwt(session_token, JwtType.TWO_FA);
	if (!decoded) throw new AppError('INVALID_SESSION_TOKEN');

	const { sub: userId } = decoded;

	const user = await prisma.authUser.findUnique({ where: { id: userId } });
	if (!user) {
		throw new AppError('USER_NOT_FOUND');
	}

	if (!user.twoFactorSecret) {
		throw new AppError('NOT_2FA_INITIALIZED');
	}

	const verified = speakeasy.totp.verify({
		secret: user.twoFactorSecret,
		encoding: 'base32',
		token,
		window: 1
	});

	if (!verified) {
		throw new AppError('INVALID_2FA_TOKEN');
	}

	const tokens = await generateJwtTokens(userId);
	return { userId, ...tokens };
}

export default twoFaVerify;
