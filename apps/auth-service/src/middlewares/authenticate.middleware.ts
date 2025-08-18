import { FastifyReply } from 'fastify';
import { UserRequest } from '../types/userRequest.js';
import sendError from '../utils/sendError.js';
import { verifyJwt } from '../utils/jwt.js';
import JwtType from '../types/jwtType.js';

const authenticate = async (request: UserRequest, reply: FastifyReply) => {
	try {
		const authHeader = request.headers['authorization'];
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return sendError(reply, 401, 'ACCESS_TOKEN_MISSING', 'Authorization token is missing');
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return sendError(reply, 401, 'ACCESS_TOKEN_MISSING', 'Authorization token is missing');
		}

		const decoded = verifyJwt(token, JwtType.ACCESS);
		if (!decoded)
			return sendError(reply, 403, 'INVALID_ACCESS_TOKEN', 'Invalid or expired access token');

		const { sub } = decoded;
		request.userId = sub;

	} catch (error: any) {
		return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
	}
};


export default authenticate;
