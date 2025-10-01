import { RouteShorthandOptions } from "fastify";
import authenticate from '@core/middlewares/authenticate.middleware.js';
import { errorResponseSchema } from "@core/schemas/error.schema.js";

const twoFaDisableSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Disable 2FA authentication. Required authentication token",
		tags: ["2FA"],
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
			404: errorResponseSchema,
			500: errorResponseSchema
		},
	}
};

export default twoFaDisableSchema;
