import { RouteShorthandOptions } from "fastify";

const loginSchema: RouteShorthandOptions = {
	schema:
	{
		description: "Login user with email and password",
		tags: ["auth"],
		body: {
			type: 'object',
			required: ['email', 'password'],
			additionalProperties: false,
			properties: {
				email: {
					type: 'string',
					format: 'email',
					description: 'Email of user'
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
				oneOf: [
					{
						type: 'object',
						additionalProperties: false,
						required: ['status', 'data', 'message'],
						properties: {
							status: { type: 'string', enum: ['success'] },
							data: {
								type: 'object',
								required: ['userId', 'accessToken', 'tokenType', 'expiresIn'],
								additionalProperties: false,
								properties: {
									userId: { type: 'string', format: 'uuid', description: 'User ID' },
									accessToken: { type: 'string' },
									tokenType: { type: 'string' },
									expiresIn: { type: 'number' },
								}
							},
							message: { type: 'string' },
						}
					},
					{
						type: 'object',
						additionalProperties: false,
						required: ['status', 'data', 'message'],
						properties: {
							status: { type: 'string', enum: ['pending'] },
							data: {
								type: 'object',
								required: ['userId', 'twoFactorRequired', 'twoFaToken'],
								additionalProperties: false,
								properties: {
									userId: { type: 'string', format: 'uuid', description: 'User ID' },
									twoFactorRequired: { type: 'boolean' },
									twoFaToken: { type: 'string' },
								}
							},
							message: { type: 'string' },
						}
					}
				]
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
			401: {
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
			403: {
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
};

export default loginSchema;
