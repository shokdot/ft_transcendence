import { RouteShorthandOptions } from "fastify";

const loginSchema: RouteShorthandOptions = {
	schema:
	{
		body: {
			type: 'object',
			required: ['login', 'password'],
			additionalProperties: false,
			properties: {
				login: {
					type: 'string',
					description: 'Can be email or username'
				},
				password: {
					type: 'string',
					minLength: 6,
					description: 'User password',
				},
			},
		},
		response: {
			200: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['success'] },
					userId: { type: 'string', format: 'uuid' },
					accessToken: { type: 'string' },
					refreshToken: { type: 'string' },
				},
			},
			400: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['error'] },
					reason: { type: 'string', description: 'Validation or bad request' },
				},
			},
			401: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['error'] },
					reason: { type: 'string', description: 'Invalid credentials' },
				},
			},
			500: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['error'] },
					reason: { type: 'string', description: 'Server error' },
				},
			},
		},
	}
};

export default loginSchema;
