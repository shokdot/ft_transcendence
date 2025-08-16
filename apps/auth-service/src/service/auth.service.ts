import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';
import crypto from 'crypto';
import JwtType from '../types/jwtType.js';
import { signJwt } from '../utils/jwt.js';
import prisma from '../utils/prisma.js';
import { sendVerificationEmail } from '../utils/email.js';


const registerUser = async ({ email, username, password }) => {

	email = email.toLowerCase().trim();
	username = username.trim();

	const existingEmail = await prisma.authUser.findUnique({ where: { email } });
	if (existingEmail) throw { code: 'EMAIL_EXISTS' };

	const existingUsername = await prisma.authUser.findUnique({ where: { username } });
	if (existingUsername) throw { code: 'USERNAME_EXISTS' };

	const passStrength = zxcvbn(password);
	if (passStrength.score < 3) throw { code: 'WEAK_PASSWORD' }

	const passwordHash = await bcrypt.hash(password, 10);

	const verificationToken = crypto.randomBytes(32).toString('hex');

	const newUser = await prisma.authUser.create({
		data: {
			email,
			username,
			passwordHash,
			verificationToken,
			isEmailVerified: true,
		},
	});

	// await sendVerificationEmail(email, verificationToken, username);

	const { passwordHash: _, ...safeUser } = newUser;
	return safeUser;
}

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

export default { registerUser, loginUser, verifyUser }
