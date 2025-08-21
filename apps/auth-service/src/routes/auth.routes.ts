import { FastifyInstance } from "fastify";
import authController from "../controllers/auth.controller.js";
import authSchema from "../schemas/auth.schema.js";
import fastifyOauth2 from "@fastify/oauth2";

export default async function userRoutes(app: FastifyInstance): Promise<void> {

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
		callbackUri: "http://localhost:3000/api/v1/auth/github/callback",
	});

	app.get('/me', authSchema.getCurrentUserSchema, authController.getCurrentUser);
	app.get('/verify-email', authSchema.verifyEmailSchema, authController.verifyUserHandler);
	app.post('/register', authSchema.registerSchema, authController.registerUserHandler);
	app.post('/login', authSchema.loginSchema, authController.loginUserHandler);
	app.post('/logut', authSchema.logutUserSchema, authController.logoutUserHandler);
	app.post('/refresh', authSchema.refreshSchema, authController.refreshToken);
	app.post('/2fa/setup', authSchema.twoFaSetupSchema, authController.twoFaSetupHandler);
	app.post('/2fa/confirm', authSchema.twoFaConfirmSchema, authController.twoFaConfirmHandler);
	app.post('/2fa/verify', authSchema.twoFaVerifySchema, authController.twoFaVerifyHandler);
	app.delete('/2fa/disable', authSchema.twoFaDisableSchema, authController.twoFaDisableHandler);
	app.get('/github/callback', authSchema.oauthLoginSchema, authController.oauthLoginHandler());
}
