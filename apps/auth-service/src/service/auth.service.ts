import bcrypt from "bcrypt";
import { PrismaClient } from '@prisma/client'
import { FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient()

export async function registerUserService(reply: FastifyReply, data: any) {

	const existingUser = await prisma.userAuth.findFirst({
		where: {
			OR: [
				{ email: data.email },
				{ username: data.username },
			],
		},
	});

	if (existingUser) {
		return reply.status(400).send({ error: "Email or username already taken" });
	}

	const passwordHash = await bcrypt.hash(data.password, 10);

	const user = await prisma.userAuth.create({
		data: {
			email: data.email,
			username: data.username,
			name: data.name,
			passwordHash,
		},
	});

	return reply.status(201).send({
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
			name: user.name,
		}
	});
}


export async function loginUserService(data: any) {
	const user = await prisma.userAuth.findUnique({ where: { email: data.email } });

	if (!user) {
		throw new Error('Invalid email or password');
	}

	const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

	if (!passwordMatch) {
		throw new Error('Invalid email or password');
	}

	// Sign JWT
	const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
		expiresIn: '1h'
	});

	return { token, user: { id: user.id, email: user.email, name: user.name } };
}
