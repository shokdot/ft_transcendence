export const errorResponseSchema = {
	type: 'object',
	required: ['status', 'error'],
	additionalProperties: false,
	properties: {
		status: { type: 'string', enum: ['error'] },
		error: {
			type: 'object',
			required: ['code', 'message', 'details'],
			additionalProperties: false,
			properties: {
				code: { type: 'string' },
				message: { type: 'string' },
				details: { type: ['object', 'null'], additionalProperties: true },
			},
		},
	},
} as const;
