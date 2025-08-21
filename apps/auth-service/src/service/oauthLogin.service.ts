import axios from 'axios';
import prisma from '../utils/prisma.js';
import generateJwtTokens from '../utils/generateJwtTokens.js';

const oauthLogin = (githubOAuth2: any) => {
	return {
		async getUserData(request: any) {

			const tokenData = await githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
			const { access_token } = tokenData.token;

			if (!access_token) throw { code: 'NO_OAUTH_TOKEN' };

			const profile = await axios.get('https://api.github.com/user', {
				headers: { Authorization: `token ${access_token}` },
			});

			const emails = await axios.get('https://api.github.com/user/emails', {
				headers: { Authorization: `token ${access_token}` },
			})

			if (profile.status !== 200 || emails.status !== 200) throw { code: 'GITHUB_API_ERROR' };


			const primaryEmail = emails.data.find((e: any) => e.primary && e.verified)?.email;
			if (!primaryEmail) throw { code: 'NO_VERIFIED_EMAIL' };

			let user = await prisma.authUser.findUnique({
				where: { email: primaryEmail },
			});

			if (!user) {
				user = await prisma.authUser.create({
					data: {
						email: primaryEmail,
						username: profile.data.login,
						passwordHash: '',
						isEmailVerified: true,
					},
				});
			}

			const tokens = await generateJwtTokens(user.id);

			return { userId: user.id, ...tokens };
		},
	};
}


export default oauthLogin;
