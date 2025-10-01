import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import sendError from './utils/sendError.js';

interface ValidationError {
	validation?: Array<{
		instancePath?: string;
		message?: string;
		params?: { missingProperty?: string };
	}>;
	validationContext?: string;
}

export function setErrorHandler(app: FastifyInstance, serviceName: string) {
	app.setErrorHandler((error: unknown, request: FastifyRequest, reply: FastifyReply) => {
		const valError = error as ValidationError;
		const timestamp = new Date().toISOString();

		// Handle Validation Errors
		if (valError.validation) {
			const firstError = valError.validation[0];
			const field =
				firstError.instancePath?.replace(/^\//, '') ||
				firstError.params?.missingProperty ||
				'unknown';
			const message = firstError.message ?? 'Invalid value';

			const logEntry = {
				'@timestamp': timestamp,  // ELK convention
				level: 'warn',
				service: serviceName,
				event: 'validationError',
				message: `Validation failed on field ${field}`,
				field,
				context: valError.validationContext ?? null,
				route: request.routeOptions?.url,
				method: request.method,
				url: request.url,
				params: request.params,
			};

			request.log.warn(logEntry);

			return sendError(
				reply,
				400,
				'VALIDATION_FAILED',
				`Request ${valError.validationContext ?? 'body'} validation failed`,
				{ field, message }
			);
		}

		// Handle Internal Errors
		const errorMessage =
			error instanceof Error && error.message ? error.message : 'Something went wrong';
		const stack = error instanceof Error ? error.stack : undefined;

		const logEntry = {
			'@timestamp': timestamp,
			level: 'error',
			service: serviceName,
			event: 'internalError',
			message: errorMessage,
			stack,
			route: request.routeOptions?.url,
			method: request.method,
			url: request.url,
			params: request.params,
			body: request.body,
			headers: request.headers,
		};

		request.log.error(logEntry);

		const errorDetails =
			process.env.NODE_ENV !== 'production' ? { stack } : undefined;

		return sendError(
			reply,
			500,
			'INTERNAL_SERVER_ERROR',
			errorMessage,
			errorDetails
		);
	});
}
