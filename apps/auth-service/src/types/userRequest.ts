import { FastifyRequest } from 'fastify';

export interface UserRequest extends FastifyRequest {
	userId?: number;
}
