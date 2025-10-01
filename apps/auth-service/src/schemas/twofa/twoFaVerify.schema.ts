import { errorResponseSchema } from "@core/schemas/error.schema.js";
import { RouteShorthandOptions } from "fastify";

const twoFaVerifySchema: RouteShorthandOptions = {
	schema:
	{
		description: "Verifying 2FA code authentication. Required session_token from login endpoint",
		tags: ["2FA"],
		body: {
			type: 'object',
			required: ['token', 'session_token',],
			additionalProperties: false,
			properties: {
				token: {
					type: 'number',
					description: 'Code from Google Authenticator app'
				},
				session_token: {
					type: 'string',
					description: 'Token generated from login endpoint'
				},
			},
		},
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
						additionalProperties: false,
						properties: {
							userId: { type: 'string', format: 'uuid' },
							accessToken: { type: 'string' },
							tokenType: { type: 'string' },
							expiresIn: { type: 'number' }
						}
					},
					message: { type: 'string' }
				},
			},
			404: errorResponseSchema,
			400: errorResponseSchema,
			500: errorResponseSchema
		},
	}
};

export default twoFaVerifySchema;
