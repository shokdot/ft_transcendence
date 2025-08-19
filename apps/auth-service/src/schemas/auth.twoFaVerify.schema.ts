import { RouteShorthandOptions } from "fastify";

const twoFaVerifySchema: RouteShorthandOptions = {
	schema:
	{
		description: "Verifying 2FA code authentication. Required session_token from login endpoint",
		tags: ["2FA"],
		body: {
			type: 'object',
			required: ['token', 'session_token',],
			additionalProperties: false,
			properties: {
				token: {
					type: 'number',
					description: 'Code from Google Authenticator app'
				},
				session_token: {
					type: 'string',
					description: 'Token generated from login endpoint'
				},
			},
		},
		response: {
			200: {
				type: 'object',
				required: ['status', 'data', 'message'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['success'] },
					data: {
						type: 'object',
						required: ['userId', 'accessToken', 'tokenType', 'expiresIn'],
						additionalProperties: false,
						properties: {
							userId: { type: 'string', format: 'uuid' },
							accessToken: { type: 'string' },
							tokenType: { type: 'string' },
							expiresIn: { type: 'number' }
						}
					},
					message: { type: 'string' }
				},
			},
			404: {
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

export default twoFaVerifySchema;
