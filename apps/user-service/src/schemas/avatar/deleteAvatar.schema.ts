import { RouteShorthandOptions } from "fastify";
import authenticate from '@core/middlewares/authenticate.middleware.js'
import { errorResponseSchema } from '@core/schemas/error.schema.js'

const deleteAvatarSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Delete avatar",
		tags: ["user"],
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
			500: errorResponseSchema
		},
	}
};

export default deleteAvatarSchema;
