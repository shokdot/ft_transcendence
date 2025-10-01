import { RouteShorthandOptions } from "fastify";
import authenticate from '@core/middlewares/authenticate.middleware.js'
import { errorResponseSchema } from "@core/schemas/error.schema.js";

const getCurrentUserSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Get current user public information.",
		tags: ["user"],
		response: {
			200: {
				type: 'object',
				required: ['status', 'data', 'message'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['success'] },
					data: {
						type: 'object',
						required: ['userId', 'username', 'avatarUrl', 'createdAt', 'updatedAt'],
						additionalProperties: false,
						properties: {
							userId: { type: 'string', format: 'uuid' },
							username: { type: 'string' },
							avatarUrl: { type: 'string' },
							createdAt: { type: 'string' },
							updatedAt: { type: 'string' },
						}

					},
					message: { type: 'string' }
				},
			},
			401: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		},
	}
};

export default getCurrentUserSchema;
