import { FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import { notificationSockets } from "@services/socket/socketInstances.service.js";
import authenticateWs from "@core/utils/authenticate.ws.js";
import handleWsError from "src/utils/handleWsError.js";

const wsNotificationHandler = async (conn: WebSocket, req: FastifyRequest) => {
	try {
		const authHeader = req.headers["authorization"];
		const authResult = authenticateWs(authHeader, conn);

		if (!authResult) { // change this
			conn.close(4001, "Unauthorized");
			return;
		}

		const { userId } = authResult;

		notificationSockets.add(userId, conn);
		// console.log(`${userId} connected to notifications WS`);

		conn.on("close", () => {
			notificationSockets.remove(userId);
			// console.log(`${userId} disconnected from notifications WS`);
		});

		// conn.on("message", (msg) => {
		// 	console.log(`Message from ${userId}: ${msg.toString()}`);
		// });
	} catch (error) {
		handleWsError(conn, error);
	}
};

export default wsNotificationHandler;
