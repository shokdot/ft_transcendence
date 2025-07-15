import { FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, LoginSchema } from '../schemas/authUser.js';
import { registerUserService, loginUserService } from '../service/auth.service.js'
import { ZodError } from "zod";

export async function registerUserHandler(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const body = registerSchema.parse(request.body);
		const user = await registerUserService(reply, body);

		reply.status(200).send(user);

	} catch (error) {
		if (error instanceof ZodError) {
			return reply.status(400).send({ error: error.issues });
		}
		return reply.status(500).send({ error: "Internal server error" });
	}
}


export async function loginUserHandler(request: FastifyRequest, reply: FastifyReply) {
	try {
		const parsed = LoginSchema.parse(request.body);
		const result = await loginUserService(parsed);

		return reply.code(200).send(result);
	} catch (error) {
		if (error instanceof ZodError) {
			return reply.code(400).send({ error: error.issues });
		}

		return reply.code(401).send({ error: error.message || 'Login failed' });
	}
}
