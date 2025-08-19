import { FastifyRequest } from 'fastify';

export interface UserRequest<BodyType = any> extends FastifyRequest<{ Body: BodyType }> {
	userId?: number;
}
