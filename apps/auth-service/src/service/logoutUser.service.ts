import JwtType from '@core/types/jwtType.js';
import prisma from "src/utils/prismaClient.js";
import { verifyJwt } from '@core/utils/jwt.js';

const logoutUser = async ({ refreshToken }) => {
	if (!refreshToken)
		return;

	try {
		const payload = verifyJwt(refreshToken, JwtType.REFRESH);
		if (!payload || !payload.tokenId) return;

		await prisma.refreshToken.deleteMany({
			where: { id: payload.tokenId },
		});

	} catch (_) {
		return;
	}
}

export default logoutUser;
