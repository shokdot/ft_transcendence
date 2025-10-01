import authenticate from "@core/middlewares/authenticate.middleware.js";
import { FastifyInstance } from "fastify";
import {
	getBlockedHandler,
	blockUserHandler,
	unblockUserHandler,
} from '@controllers/blocked/index.js'
// import { blocked } from "src/schemas/index.js"; // we’ll define schemas after

const blockedRoutes = async (app: FastifyInstance) => {
	// app.get("/", blocked.getBlocked, getBlockedHandler);
	app.get("/", { preHandler: authenticate }, getBlockedHandler);

	// app.post("/:targetUserId", blocked.blockUser, blockUserHandler);
	app.post("/:targetUserId", { preHandler: authenticate }, blockUserHandler);

	// app.delete("/:targetUserId", blocked.unblockUser, unblockUserHandler);
	app.delete("/:targetUserId", { preHandler: authenticate }, unblockUserHandler);
};

export default blockedRoutes;
