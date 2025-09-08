import { FastifyRequest } from 'fastify';

export interface AuthRequest<
	TBody = unknown,
	TQuery = unknown,
	TParams = unknown,
	TCookies = unknown>
	extends FastifyRequest<{
		Body: TBody;
		Querystring: TQuery;
		Params: TParams;
		Cookies: TCookies;
	}> {
	userId?: string;
	accessToken?: string;
}
