import WebSocket from "ws";

const handleWsError = (conn: WebSocket, error: any) => {
	if (!error || !error.code) {
		conn.close(1011, "INTERNAL_SERVER_ERROR");
		return;
	}

	switch (error.code) {
		case "NO_STATUS_PROVIDED":
			conn.close(1008, "NO_STATUS_PROVIDED");
			break;
		case "INVALID_STATUS":
			conn.close(1008, "INVALID_STATUS");
			break;
		case "USER_NOT_FOUND":
			conn.close(1008, "USER_NOT_FOUND");
			break;
		default:
			conn.close(1011, "INTERNAL_SERVER_ERROR");
	}
};

export default handleWsError;
