import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';
import crypto from 'crypto';
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

export default registerUser;
