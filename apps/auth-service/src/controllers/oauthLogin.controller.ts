import { FastifyReply, FastifyRequest } from "fastify";
import authService from "../service/auth.service.js";
import sendError from "../utils/sendError.js";

declare module "fastify" {
	interface FastifyInstance {
		githubOAuth2: any;
	}
}

const oauthLoginHandler = () => {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const githubOAuth2 = request.server.githubOAuth2;
			const auth = authService.oauthLogin(githubOAuth2);
			const result = await auth.getUserData(request);

			reply.setCookie('refreshToken', result.refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				path: '/refresh',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60
			});

			return reply.status(200).send({
				status: 'success',
				data: {
					userId: result.userId,
					accessToken: result.accessToken,
					tokenType: 'Bearer',
					expiresIn: 900,
				},
				message: 'Login successful',
			});

		}
		catch (error: any) {
			if (error.code === 'NO_OAUTH_TOKEN') {
				return sendError(reply, 400, error.code, 'Failed to obtain OAuth token from GitHub.')
			}
			if (error.code === 'GITHUB_API_ERROR') {
				return sendError(reply, 502, error.code, 'Failed to fetch user profile or emails from GitHub API.')
			}
			if (error.code === 'NO_VERIFIED_EMAIL') {
				return sendError(reply, 400, error.code, 'No verified primary email found in GitHub account.')
			}
			return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error')

		}
	};
};

export default oauthLoginHandler;
