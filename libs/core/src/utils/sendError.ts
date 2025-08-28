import { FastifyReply } from 'fastify';

const sendError = (reply: FastifyReply, code: number, errorCode: string, message: string, details?: object) => {
	return reply.code(code).send({
		status: 'error',
		error: {
			code: errorCode, message, details: details ?? null
		}
	});
}

export default sendError;
