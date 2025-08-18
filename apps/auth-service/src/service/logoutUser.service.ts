import JwtType from "../types/jwtType.js";
import { verifyJwt } from "../utils/jwt.js";
import prisma from "../utils/prisma.js";

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
