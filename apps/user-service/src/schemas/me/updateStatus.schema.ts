import { RouteShorthandOptions } from "fastify";
import authenticate from '@core/middlewares/authenticate.middleware.js'
import { errorResponseSchema } from "@core/schemas/error.schema.js";

const updateUserStatusSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Update current user status (ONLINE, OFFLINE, IN_GAME)",
		tags: ["Status"],
		body: {
			type: "object",
			required: ['status'],
			properties: {
				status: { type: "string" },
			},
			additionalProperties: false,
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
			400: errorResponseSchema,
			401: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			409: errorResponseSchema,
			500: errorResponseSchema
		},
	}
};

export default updateUserStatusSchema;
