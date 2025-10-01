import { errorResponseSchema } from "@core/schemas/error.schema.js";
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
			401: errorResponseSchema,
			403: errorResponseSchema,
			500: errorResponseSchema
		}
	}
}

export default refreshSchema;
