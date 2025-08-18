import { RouteShorthandOptions } from "fastify";

const registerSchema: RouteShorthandOptions =
{
	schema:
	{
		description: "Registration/Create user",
		tags: ["auth"],
		body: {
			type: 'object',
			required: ['email', 'username', 'password',],
			additionalProperties: false,
			properties: {
				email: {
					type: 'string',
					format: 'email',
					description: 'User email address'
				},
				username: {
					type: 'string',
					minLength: 1,
					description: 'Display name'
				},
				password: {
					type: 'string',
					minLength: 6,
					description: 'Password minimum 6 characters'
				},
			},
		},
		response: {
			201: {
				type: 'object',
				required: ['status', 'data', 'message'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['success'] },
					data: {
						type: 'object',
						required: ['userId', 'email', 'username'],
						additionalProperties: false,
						properties: {
							userId: { type: 'string', format: 'uuid', description: 'User ID' },
							email: { type: 'string', format: 'email' },
							username: { type: 'string' },
						}
					},
					message: { type: 'string' }
				},
			},
			400: {
				type: 'object',
				required: ['status', 'error'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['error'] },
					error: {
						type: 'object',
						required: ['code', 'message', 'details'],
						properties: {
							code: { type: 'string' },
							message: { type: 'string' },
							details: { type: ['object', 'null'], additionalProperties: true, },
						},
						additionalProperties: false,
					},
				},
			},
			409: {
				type: 'object',
				required: ['status', 'error'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['error'] },
					error: {
						type: 'object',
						required: ['code', 'message', 'details'],
						properties: {
							code: { type: 'string' },
							message: { type: 'string' },
							details: { type: ['object', 'null'], additionalProperties: true, },
						},
						additionalProperties: false,
					},
				},
			},
			500: {
				type: 'object',
				required: ['status', 'error'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['error'] },
					error: {
						type: 'object',
						required: ['code', 'message', 'details'],
						properties: {
							code: { type: 'string' },
							message: { type: 'string' },
							details: { type: ['object', 'null'], additionalProperties: true, },
						},
						additionalProperties: false,
					},
				},
			},
		},
	}
}


export default registerSchema;
