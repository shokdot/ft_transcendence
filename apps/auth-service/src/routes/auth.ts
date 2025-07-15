import { FastifyInstance } from "fastify";
import { registerUserHandler, loginUserHandler } from "../controllers/auth.controller.js";

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.post('/register', {
		schema: {
			tags: ['User'],
			summary: 'Register a new user',
			body: {
				type: 'object',
				required: ['email', 'password'],
				properties: {
					email: { type: 'string', format: 'email' },
					password: { type: 'string', minLength: 6 },
				}
			},
			response: {
				201: {
					description: 'User registered successfully',
					type: 'object',
					properties: {
						id: { type: 'string' },
						email: { type: 'string' }
					}
				},
				400: {
					description: 'Bad request',
					type: 'object',
					properties: {
						error: { type: 'string' }
					}
				}
			}
		}, handler: registerUserHandler
	});
	app.post('/login', loginUserHandler);
}
