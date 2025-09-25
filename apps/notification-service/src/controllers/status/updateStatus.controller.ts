import { FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import { updateStatus } from "src/service/status/index.js";
import authenticateWs from '@core/utils/authenticate.ws.js'
import handleWsError from "src/utils/handleWsError.js";

const updateStatusHandler = async (conn: WebSocket, request: FastifyRequest) => {
	const authHeader = request.headers['authorization'];
	const authResult = authenticateWs(authHeader, conn);

	if (!authResult) return;

	const { token } = authResult;

	try {
		await updateStatus(token, 'ONLINE');
	}
	catch (error) {
		handleWsError(conn, error);
	}

	conn.on('close', async () => {
		try {
			await updateStatus(token, 'OFFLINE');
		}
		catch (error) {
			handleWsError(conn, error);
		}
	});
};


export default updateStatusHandler;
