import { RouteShorthandOptions } from "fastify";
import authenticate from '@core/middlewares/authenticate.middleware.js';
import { errorResponseSchema } from "@core/schemas/error.schema.js";

const logoutUserSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Logut user delete cookie",
		tags: ["auth"],
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
			500: errorResponseSchema,
		},
	}
};

export default logoutUserSchema;
