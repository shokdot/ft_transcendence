import { RouteShorthandOptions } from "fastify";
import authenticate from "../middlewares/authenticate.middleware.js";

const twoFaConfirmSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Confirmation 2FA authentication. Required authentication token",
		tags: ["2FA"],
		response: {
			200: {
				type: 'object',
				required: ['status', 'data', 'message'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['success'] },
					data: {
						type: 'object',
						required: ['userId'],
						additionalProperties: false,
						properties: {
							userId: { type: 'string' }
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

export default twoFaConfirmSchema;
