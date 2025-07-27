import bcrypt from "bcrypt";
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient() //common

const registerUser = async ({ email, username, password }) => {
	const existingEmail = await prisma.authUser.findUnique({ where: { email } });
	if (existingEmail) throw { code: 'EMAIL_EXISTS' };

	const existingUsername = await prisma.authUser.findUnique({ where: { username } });
	if (existingUsername) throw { code: 'USERNAME_EXISTS' };

	const passwordHash = await bcrypt.hash(password, 10);

	const newUser = await prisma.authUser.create({
		data: {
			email,
			username,
			passwordHash,
		},
	});

	// Don't return the password hash
	const { passwordHash: _, ...safeUser } = newUser;
	return safeUser;
}

// const loginUser = async (data: any) => {
// 	const user = await prisma.userAuth.findUnique({ where: { email: data.email } });

// 	if (!user) {
// 		throw new Error('Invalid email or password');
// 	}

// 	const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

// 	if (!passwordMatch) {
// 		throw new Error('Invalid email or password');
// 	}

// 	// Sign JWT
// 	const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
// 		expiresIn: '1h'
// 	});

// 	return { token, user: { id: user.id, email: user.email, name: user.name } };
// }


export default { registerUser }
