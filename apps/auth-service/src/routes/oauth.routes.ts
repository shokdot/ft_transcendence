import { FastifyInstance } from "fastify";
import fastifyOauth2 from "@fastify/oauth2";
import authController from "src/controllers/auth.controller.js";
import authSchema from "src/schemas/auth.schema.js";

const oauthRoutes = async (app: FastifyInstance) => {
	app.register(fastifyOauth2, {
		schema: {
			tags: ['OAuth'],
			description: 'Login/Register user with OAuth github provider',
		},
		name: "githubOAuth2",
		scope: ["user:email", "read:user"],
		credentials: {
			client: {
				id: process.env.GITHUB_CLIENT_ID!,
				secret: process.env.GITHUB_CLIENT_SECRET!,
			},
			auth: {
				authorizeHost: "https://github.com",
				authorizePath: "/login/oauth/authorize",
				tokenHost: "https://github.com",
				tokenPath: "/login/oauth/access_token",
			},
		},
		startRedirectPath: "/github",
		callbackUri: "http://localhost:3000/api/v1/auth/oauth/github/callback",
	});

	app.get('/github/callback', authSchema.oauthLoginSchema, authController.oauthLoginHandler());
}

export default oauthRoutes;
