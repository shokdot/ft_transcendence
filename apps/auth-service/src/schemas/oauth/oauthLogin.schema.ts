import { errorResponseSchema } from "@core/schemas/error.schema.js";
import { RouteShorthandOptions } from "fastify";

const oauthLoginSchema: RouteShorthandOptions = {
	schema:
	{
		tags: ['OAuth'],
		description: 'Login/Register user with OAuth github provider callback which must redirect to home',
		response: {
			200: {
				oneOf: [
					{
						type: 'object',
						additionalProperties: false,
						required: ['status', 'data', 'message'],
						properties: {
							status: { type: 'string', enum: ['success'] },
							data: {
								type: 'object',
								required: ['userId', 'accessToken', 'tokenType', 'expiresIn'],
								additionalProperties: false,
								properties: {
									userId: { type: 'string', format: 'uuid', description: 'User ID' },
									accessToken: { type: 'string' },
									tokenType: { type: 'string' },
									expiresIn: { type: 'number' },
								}
							},
							message: { type: 'string' },
						}
					},
					{
						type: 'object',
						additionalProperties: false,
						required: ['status', 'data', 'message'],
						properties: {
							status: { type: 'string', enum: ['pending'] },
							data: {
								type: 'object',
								required: ['userId', 'twoFactorRequired', 'twoFaToken'],
								additionalProperties: false,
								properties: {
									userId: { type: 'string', format: 'uuid', description: 'User ID' },
									twoFactorRequired: { type: 'boolean' },
									twoFaToken: { type: 'string' },
								}
							},
							message: { type: 'string' },
						}
					}
				]
			},
			400: errorResponseSchema,
			500: errorResponseSchema,
			502: errorResponseSchema,
			503: errorResponseSchema
		},
	}
};

export default oauthLoginSchema;
