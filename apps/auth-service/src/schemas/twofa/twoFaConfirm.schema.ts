import { RouteShorthandOptions } from "fastify";
import authenticate from '@core/middlewares/authenticate.middleware.js';
import { errorResponseSchema } from "@core/schemas/error.schema.js";

const twoFaConfirmSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Confirmation 2FA authentication. Required authentication token",
		tags: ["2FA"],
		body: {
			type: 'object',
			required: ['token'],
			additionalProperties: false,
			properties: {
				token: {
					type: 'string',
				}
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
						required: ['userId'],
						additionalProperties: false,
						properties: {
							userId: { type: 'string' }
						}
					},
					message: { type: 'string' }
				},
			},
			404: errorResponseSchema,
			400: errorResponseSchema,
			500: errorResponseSchema
		},
	}
};

export default twoFaConfirmSchema;
