import { errorResponseSchema } from "@core/schemas/error.schema.js";
import { RouteShorthandOptions } from "fastify";

const resetPassSchema: RouteShorthandOptions = {
	schema:
	{
		description: "",
		tags: ["password management"],
		body: {
			type: 'object',
			required: ['token', 'password'],
			additionalProperties: false,
			properties: {
				token: { type: 'string', },
				password: { type: 'string' }
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
			500: errorResponseSchema
		},
	}
};

export default resetPassSchema;
