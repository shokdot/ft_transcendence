import { FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import { updateStatus } from '@services/status/index.js';
import authenticateWs from '@core/utils/authenticate.ws.js'
import handleWsError from "src/utils/handleWsError.js";

const wsStatusHandler = async (conn: WebSocket, request: FastifyRequest) => {
	const authResult = authenticateWs(request.headers['authorization'], conn); // fix change it use only with throw

	if (!authResult) return; // change this

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


export default wsStatusHandler;
