import axios from 'axios';
import prisma from "src/utils/prismaClient.js";
import generateJwtTokens from 'src/utils/generateJwtTokens.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '@core/utils/AppError.js';

const oauthLogin = (githubOAuth2: any) => {
	return {
		async getUserData(request: any) {

			const tokenData = await githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
			const { access_token } = tokenData.token;

			if (!access_token) throw new AppError('NO_OAUTH_TOKEN');

			const profile = await axios.get('https://api.github.com/user', {
				headers: { Authorization: `token ${access_token}` },
			});

			const emails = await axios.get('https://api.github.com/user/emails', {
				headers: { Authorization: `token ${access_token}` },
			})

			if (profile.status !== 200 || emails.status !== 200) throw new AppError('GITHUB_API_ERROR');


			const primaryEmail = emails.data.find((e: any) => e.primary && e.verified)?.email;
			if (!primaryEmail) throw new AppError('NO_VERIFIED_EMAIL');

			let user = await prisma.authUser.findUnique({
				where: { email: primaryEmail },
			});

			if (!user) {
				user = await prisma.authUser.create({
					data: {
						email: primaryEmail,
						passwordHash: '',
						isEmailVerified: true,
					},
				});

				const username = `user${uuidv4().slice(0, 8)}`;
				const result = await axios.post('http://127.0.0.1:3001/api/v1/users', {
					'userId': user.id,
					username
				});

				if (result.status !== 201) throw new AppError('USER_SERVICE_ERROR');
			}

			const tokens = await generateJwtTokens(user.id);

			return { userId: user.id, ...tokens };
		},
	};
}

export default oauthLogin;
