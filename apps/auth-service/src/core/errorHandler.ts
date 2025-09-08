import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import sendError from '@core/utils/sendError.js';

export function setErrorHandler(app: FastifyInstance) {
	app.setErrorHandler((error: unknown, request: FastifyRequest, reply: FastifyReply) => {
		if ((error as any).validation) {
			const firstError = (error as any).validation[0];
			const field = firstError.instancePath?.replace(/^\//, '') || firstError.params?.missingProperty || 'unknown';
			const message = firstError.message;

			request.log.warn({
				event: 'validationError',
				field,
				message,
				context: (error as any).validationContext,
			});

			return sendError(
				reply,
				400,
				'VALIDATION_FAILED',
				`Request ${(error as any).validationContext} validation failed`,
				{ field, message }
			);
		}

		request.log.error({
			event: 'internalError',
			error: error instanceof Error ? error.message : JSON.stringify(error),
			stack: error instanceof Error ? error.stack : undefined,
		});

		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', error instanceof Error ? error.message : 'Something went wrong');
	});
}
