import JwtType from '@core/types/jwtType.js';
import prisma from "src/utils/prismaClient.js";
import { verifyJwt } from '@core/utils/jwt.js';
import axios from 'axios';

const logoutUser = async ({ accessToken, refreshToken }) => {
	if (!refreshToken)
		return;

	if (!accessToken)
		return;

	try {
		const payload = verifyJwt(refreshToken, JwtType.REFRESH);
		if (!payload || !payload.tokenId) return;

		await prisma.refreshToken.deleteMany({
			where: { id: payload.tokenId },
		});

		await axios.patch('http://127.0.0.1:3001/api/v1/users/me/status',
			{
				status: 'OFFLINE'
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});


	} catch (_) {
		return;
	}
}

export default logoutUser;
