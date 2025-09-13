import { FastifyInstance } from "fastify";
import basicRoutes from "./basic.routes.js";
import meRoutes from "./me.routes.js";
import avatarRoutes from "./avatar.routes.js";
import friendsRoutes from "./friends.routes.js";

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.register(basicRoutes, { prefix: '/' });
	app.register(meRoutes, { prefix: '/me' });
	app.register(avatarRoutes, { prefix: '/me/avatar' });
	app.register(friendsRoutes, { prefix: '/me/friends' });
	// settings
	// Optional: last active timestamp (/:userId/last-active)
	// friends
}
