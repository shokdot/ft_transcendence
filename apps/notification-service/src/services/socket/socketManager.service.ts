import { WebSocket } from "ws";

export default class SocketManager {
	private sockets = new Map<string, WebSocket>();

	add(userId: string, ws: WebSocket) {
		this.sockets.set(userId, ws);
	}

	remove(userId: string) {
		this.sockets.delete(userId);
	}

	get(userId: string): WebSocket | undefined {
		return this.sockets.get(userId);
	}

	send(userId: string, data: any) {
		const ws = this.get(userId);
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(data));
		}
	}

	broadcast(data: any) {
		for (const ws of this.sockets.values()) {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify(data));
			}
		}
	}
}
