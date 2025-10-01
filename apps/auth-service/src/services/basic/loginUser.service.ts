import bcrypt from 'bcrypt';
import prisma from "src/utils/prismaClient.js";
import generateJwtTokens from 'src/utils/generateJwtTokens.js';
import JwtType from '@core/types/jwtType.js';
import { signJwt } from '@core/utils/jwt.js';
import { AppError } from '@core/utils/AppError.js';

const loginUser = async ({ email, password }): Promise<any> => {
	email = email.trim().toLowerCase();

	const user = await prisma.authUser.findUnique({
		where: { email },
	});

	if (!user) throw new AppError('NOT_REGISTERED');

	if (!user.isEmailVerified) throw new AppError('EMAIL_NOT_VERIFIED');

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
	if (!isPasswordValid) throw new AppError('INVALID_CREDENTIALS');

	if (user.twoFactorEnabled) {
		const payload = { sub: user.id, stage: "2FA" };
		return { userId: user.id, twoFactorRequired: true, twoFaToken: signJwt(payload, JwtType.TWO_FA) };
	}

	const tokens = await generateJwtTokens(user.id);

	return { userId: user.id, ...tokens };
};

export default loginUser;
