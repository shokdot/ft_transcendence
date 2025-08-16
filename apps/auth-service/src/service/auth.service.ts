import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';
import JwtType from '../types/jwtType.js';
import { signJwt } from '../utils/jwt.js';
import prisma from '../utils/prisma.js';


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

	const newUser = await prisma.authUser.create({
		data: {
			email,
			username,
			passwordHash,
		},
	});

	const { passwordHash: _, ...safeUser } = newUser;
	return safeUser;
}

const loginUser = async ({ login, password }) => {
	//check is verfied email
	const isEmail = login.includes('@');
	login = login.trim().toLowerCase();

	const user = await prisma.authUser.findUnique({
		where: isEmail ? { email: login } : { username: login },
	});

	// user.isEmailVerified = true;
	if (!user.isEmailVerified) throw { code: 'EMAIL_NOT_VERIFIED' };

	if (!user) throw { code: 'NOT_REGISTERED' };

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
	if (!isPasswordValid) throw { code: 'INVALID_CREDENTIALS' }

	const accessToken = signJwt({ sub: user.id, username: user.username }, JwtType.ACCESS);
	const refreshToken = signJwt({ sub: user.id }, JwtType.REFRESH);

	return { userId: user.id, accessToken, refreshToken };
};

export default { registerUser, loginUser }
