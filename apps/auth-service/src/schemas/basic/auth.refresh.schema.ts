import { RouteShorthandOptions } from "fastify";

const refreshSchema: RouteShorthandOptions = {
	schema: {
		description: "Refresh access token using refresh token cookie",
		tags: ["auth"],
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
						properties: {
							userId: { type: 'string', format: 'uuid', description: 'User ID' },
							accessToken: { type: 'string' },
							tokenType: { type: 'string' },
							expiresIn: { type: 'number' }
						}
					},
					message: { type: 'string' }
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
		}

	}
}

export default refreshSchema;
