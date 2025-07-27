import { FastifyRequest, FastifyReply } from 'fastify';
import RegisterBody from '../interfaces/registerBody.js';
import authService from '../service/auth.service.js'


const registerUserHandler = async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
	try {
		const user = await authService.registerUser(request.body);
		return reply.code(200).send(user);
	} catch (error: any) {
		if (error.code === 'EMAIL_EXISTS') {
			return reply.code(400).send({ message: 'Email is already registered' });
		}
		if (error.code === 'USERNAME_EXISTS') {
			return reply.code(400).send({ message: 'Username is already taken' });
		}
		console.error('Registration error:', error);
		return reply.code(500).send({ message: 'Internal server error' });
	}
}


const loginUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	console.log('here');
}


export default { registerUserHandler, loginUserHandler }
