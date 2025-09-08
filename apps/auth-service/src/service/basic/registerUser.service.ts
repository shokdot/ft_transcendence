import axios from 'axios';
import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';
import crypto from 'crypto';
import prisma from "src/utils/prismaClient.js";
import { sendVerificationEmail } from 'src/utils/email.js';

const registerUser = async ({ email, username, password }) => {

	email = email.toLowerCase().trim();
	username = username.trim();

	const existingEmail = await prisma.authUser.findUnique({ where: { email } });
	if (existingEmail) throw { code: 'EMAIL_EXISTS' };

	const passStrength = zxcvbn(password);
	if (passStrength.score < 3) throw { code: 'WEAK_PASSWORD' }

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

	const result = await axios.post('http://127.0.0.1:3001/api/v1/users', {
		'userId': newUser.id,
		username
	});

	if (result.status !== 201) {
		await prisma.authUser.delete({ where: { id: newUser.id } });
		if (result.status === 409) throw { code: 'USERNAME_EXISTS' };
		else throw { code: 'USER_SERVICE_ERROR' };
	}

	// await sendVerificationEmail(email, verificationToken, username); //enable in prod

	const { passwordHash: _, ...safeUser } = newUser;

	return { ...safeUser, username };
}

export default registerUser;
