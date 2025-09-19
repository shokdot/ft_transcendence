import { AuthRequest } from "@core/types/authRequest.js";
import { WebSocket } from "ws";


const updateStatusHandler = async (conn: WebSocket, request: AuthRequest) => {
	const token = request.accessToken;
	try {
		await fetch(`http://localhost:3001/api/v1/users/me/status`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", "authorization": token },
			body: JSON.stringify({ status: "ONLINE" }),
		});

	} catch (err) {
		console.error("Error updating online status:", err);
	}

	conn.on('close', async () => {
		try {
			await fetch(`http://localhost:3001/api/v1/users/me/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json", "authorization": token },
				body: JSON.stringify({ status: "OFFLINE" }),
			});
		} catch (err) {
			console.error("Error updating online status:", err);
		}
	});
};


export default updateStatusHandler;
