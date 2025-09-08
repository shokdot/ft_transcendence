import { FastifyInstance } from "fastify";
import oauthRoutes from "./oauth.routes.js";
import basicAuthRoutes from "./basic.routes.js";
import twofaRoutes from "./twofa.routes.js";
import passwordRoutes from "./password.routes.js";

export default async function userRoutes(app: FastifyInstance): Promise<void> {
	app.register(basicAuthRoutes, { prefix: "/" });
	app.register(oauthRoutes, { prefix: "/oauth" });
	app.register(twofaRoutes, { prefix: "/2fa" });
	app.register(passwordRoutes, { prefix: "/password" });
}
