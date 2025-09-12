import { RouteShorthandOptions } from "fastify";

const resetPassSchema: RouteShorthandOptions = {
	schema:
	{
		description: "",
		tags: ["password management"],
		body: {
			type: 'object',
			required: ['token', 'password'],
			additionalProperties: false,
			properties: {
				token: { type: 'string', },
				password: { type: 'string' }
			},
		},
		response: {
			200: {
				type: 'object',
				required: ['status', 'message'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['success'] },
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

export default resetPassSchema;
