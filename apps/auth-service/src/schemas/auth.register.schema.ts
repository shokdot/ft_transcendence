import { RouteShorthandOptions } from "fastify";

const registerSchema: RouteShorthandOptions =
{
	schema:
	{
		body: {
			type: 'object',
			required: ['email', 'username', 'password',],
			additionalProperties: false,
			properties: {
				email: { type: 'string', format: 'email', description: 'User email address' },
				username: { type: 'string', minLength: 1, description: 'Display name' },
				password: { type: 'string', minLength: 6, description: 'Minimum 6 characters' },
			},
		},
		response: {
			201: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['success'] },
					id: { type: 'string', format: 'uuid' },
					email: { type: 'string', format: 'email' },
					username: { type: 'string' },
				},
			},
			400: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['error'] },
					reason: { type: 'string' },
				},
			},
			409: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['error'] },
					reason: { type: 'string', description: 'Duplicate email or username' },
				},
			},
			500: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['error'] },
					reason: { type: 'string', description: 'Internal server error' },
				},
			},
		},
	}
}


export default registerSchema;
