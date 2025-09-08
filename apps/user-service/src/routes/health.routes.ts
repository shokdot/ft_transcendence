import { FastifyInstance } from "fastify";

const healthRoutes = async (app: FastifyInstance): Promise<void> => {
	app.get("/health", async () => {
		return {
			status: "ok",
			uptime: process.uptime(),
			timestamp: new Date().toISOString(),
		};
	});
}

export default healthRoutes;
