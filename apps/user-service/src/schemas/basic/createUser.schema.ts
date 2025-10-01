import { errorResponseSchema } from "@core/schemas/error.schema.js";
import { RouteShorthandOptions } from "fastify";

const createUserSchema: RouteShorthandOptions = {
	schema:
	{
		description: "Create user. Calls from auth-service dont call it manually use auth-service register instead",
		tags: ["user"],
		body: {
			type: 'object',
			required: ['userId', 'username'],
			additionalProperties: false,
			properties: {
				userId: {
					type: 'string',
					format: 'uuid',
					description: 'User identifaction'
				},
				username: {
					type: 'string',
					minLength: 1,
					description: 'Display name'
				},
			},
		},
		response: {
			201: {
				type: 'object',
				required: ['status', 'message'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['success'] },
					message: { type: 'string' }
				},
			},
			409: errorResponseSchema,
			500: errorResponseSchema,
		},
	}
};

export default createUserSchema;
