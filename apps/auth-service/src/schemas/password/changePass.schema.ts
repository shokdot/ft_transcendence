import authenticate from "@core/middlewares/authenticate.middleware.js";
import { errorResponseSchema } from "@core/schemas/error.schema.js";
import { RouteShorthandOptions } from "fastify";

const changePassSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Change password",
		tags: ["password management"],
		body: {
			type: 'object',
			required: ['oldPassword', 'newPassword'],
			additionalProperties: false,
			properties: {
				oldPassword: { type: 'string', },
				newPassword: { type: 'string' }
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
			400: errorResponseSchema,
			401: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema,
		},
	}
};

export default changePassSchema;
