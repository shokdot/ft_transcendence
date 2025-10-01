import { errorResponseSchema } from "@core/schemas/error.schema.js";
import { RouteShorthandOptions } from "fastify";

const verifyEmailSchema: RouteShorthandOptions = {
	schema: {
		description: "Email verifying via queryparam 'token'",
		tags: ["auth"],
		querystring: {
			type: 'object',
			properties: {
				token: { type: 'string', minLength: 1 }
			},
			required: ['token'],
			additionalProperties: false
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
		}

	}
}

export default verifyEmailSchema;
