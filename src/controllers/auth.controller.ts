import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'

const users: { [username: string]: string } = {} // username: hashedPassword

export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
	const { username, password } = request.body as { username: string; password: string }

	if (users[username]) {
		return reply.status(400).send({ error: 'User already exists' })
	}

	const hashedPassword = await bcrypt.hash(password, 10)
	users[username] = hashedPassword

	const token = await reply.jwtSign({ username })  // <--- here

	return reply.send({ token })
}

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
	const { username, password } = request.body as { username: string; password: string }

	const userPassword = users[username]
	if (!userPassword) {
		return reply.status(401).send({ error: 'Invalid credentials' })
	}

	const isValid = await bcrypt.compare(password, userPassword)
	if (!isValid) {
		return reply.status(401).send({ error: 'Invalid credentials' })
	}

	const token = await reply.jwtSign({ username })  // <--- here

	return reply.send({ token })
}
