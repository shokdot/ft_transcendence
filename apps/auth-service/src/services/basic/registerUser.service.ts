import axios from 'axios';
import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';
import crypto from 'crypto';
import prisma from "src/utils/prismaClient.js";
import { sendVerificationEmail } from 'src/utils/email.js';
import { AppError } from '@core/utils/AppError.js';

const registerUser = async ({ email, username, password }) => {

	email = email.toLowerCase().trim();
	username = username.trim();

	const existingEmail = await prisma.authUser.findUnique({ where: { email } });
	if (existingEmail) throw new AppError('EMAIL_EXISTS');

	const passStrength = zxcvbn(password);
	if (passStrength.score < 3) throw new AppError('WEAK_PASSWORD');

	const passwordHash = await bcrypt.hash(password, 10);

	const verificationToken = crypto.randomBytes(32).toString('hex');

	const newUser = await prisma.authUser.create({
		data: {
			email,
			passwordHash,
			verificationToken,
			isEmailVerified: true,
		},
	});

	try {
		await axios.post('http://127.0.0.1:3001/api/v1/users/', {
			'userId': newUser.id,
			username
		});

	} catch (error: any) {
		if (axios.isAxiosError(error)) {
			await prisma.authUser.delete({ where: { id: newUser.id } });
			if (error.response?.status === 409) {
				throw new AppError('USERNAME_EXISTS');
			}
			else {
				throw new AppError('USER_SERVICE_ERROR');
			}
		}
		throw new AppError(error.code);
	}

	// await sendVerificationEmail(email, verificationToken, username); //enable in prod

	const { passwordHash: _, ...safeUser } = newUser;

	return { ...safeUser, username };
}

export default registerUser;
