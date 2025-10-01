import { RouteShorthandOptions } from "fastify";
import authenticate from '@core/middlewares/authenticate.middleware.js';
import { errorResponseSchema } from "@core/schemas/error.schema.js";

const twoFaSetupSchema: RouteShorthandOptions = {
	preHandler: [authenticate],
	schema:
	{
		description: "Enable 2FA authentication. Required authentication token",
		tags: ["2FA"],
		response: {
			200: {
				type: 'object',
				required: ['status', 'data', 'message'],
				additionalProperties: false,
				properties: {
					status: { type: 'string', enum: ['success'] },
					data: {
						type: 'object',
						required: ['userId', 'qrCodeDataURL'],
						additionalProperties: false,
						properties: {
							userId: { type: 'string' },
							qrCodeDataURL: { type: 'string' }
						}
					},
					message: { type: 'string' }
				},
			},
			400: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		},
	}
};

export default twoFaSetupSchema;
