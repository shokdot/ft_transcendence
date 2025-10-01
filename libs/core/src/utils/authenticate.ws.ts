import { WebSocket } from 'ws';
import extractToken from './extractToken.js';
import decodeToken from './decodeToken.js';

const authenticateWs = (authHeader: string, ws: WebSocket) => { // change this without rethrow
	try {
		const token = extractToken(authHeader);
		const userId = decodeToken(token);

		return { userId, token };
	}
	catch (error: any) {
		switch (error.code) {
			case 'ACCESS_TOKEN_MISSING':
				ws.close(1008, 'ACCESS_TOKEN_MISSING');
				break;
			case 'INVALID_ACCESS_TOKEN':
				ws.close(1008, 'INVALID_ACCESS_TOKEN');
				break;
			default:
				ws.close(1011, 'INTERNAL_SERVER_ERROR');
		}
		return null;
	}
};
export default authenticateWs;
