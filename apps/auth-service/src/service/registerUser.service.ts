import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';
import crypto from 'crypto';
import prisma from "../utils/prismaClient.js";
import { sendVerificationEmail } from 'src/utils/email.js';
import axios from 'axios';

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

	// await sendVerificationEmail(email, verificationToken, username); //enable in prod

	const result = await axios.post('http://127.0.0.1:3001/api/v1/users', {
		'userId': newUser.id,
		username
	});

	if (result.status !== 200) {
		await prisma.authUser.delete({ where: { id: newUser.id } });
		throw { code: 'USER_SERVICE_ERR' };
	}

	const { passwordHash: _, ...safeUser } = newUser;
	return safeUser;
}

export default registerUser;
