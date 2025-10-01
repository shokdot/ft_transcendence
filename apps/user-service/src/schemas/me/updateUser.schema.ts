import { RouteShorthandOptions } from "fastify";
import authenticate from '@core/middlewares/authenticate.middleware.js'
import { errorResponseSchema } from "@core/schemas/error.schema.js";

const updateUserSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Update current user information (username, avatarUrl, preferences, metadata)",
		tags: ["user"],
		body: {
			type: "object",
			properties: {
				username: { type: "string" },
				avatarUrl: { type: "string" },
			},
			additionalProperties: false,
			minProperties: 1,
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
						required: ['userId', 'username', 'avatarUrl', 'preferences', 'metadata', 'createdAt', 'updatedAt'],
						additionalProperties: false,
						properties: {
							userId: { type: 'string', format: 'uuid' },
							username: { type: 'string' },
							avatarUrl: { type: 'string' },
							preferences: { type: 'object' },
							metadata: { type: 'object' },
							createdAt: { type: 'string' },
							updatedAt: { type: 'string' },
						}

					},
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

export default updateUserSchema;
