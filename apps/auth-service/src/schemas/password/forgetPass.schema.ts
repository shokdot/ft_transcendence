import { errorResponseSchema } from "@core/schemas/error.schema.js";
import { RouteShorthandOptions } from "fastify";

const forgotPassSchema: RouteShorthandOptions = {
	schema:
	{
		description: "Forgot password token generating request.",
		tags: ["password management"],
		body: {
			type: 'object',
			required: ['email'],
			additionalProperties: false,
			properties: {
				email: { type: 'string' },
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
			404: errorResponseSchema,
			500: errorResponseSchema
		},
	}
};

export default forgotPassSchema;
