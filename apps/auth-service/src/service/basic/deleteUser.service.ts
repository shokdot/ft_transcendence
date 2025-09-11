import prisma from "src/utils/prismaClient.js";
import axios from 'axios';

const deleteUser = async (userId: string, accessToken: string): Promise<any> => {
	const user = await prisma.authUser.findUnique({
		where: { id: userId }
	});

	if (!user) throw { code: 'USER_NOT_FOUND' };

	try {
		await axios.delete('http://127.0.0.1:3001/api/v1/users/me', {
			headers: {
				Authorization: `${accessToken}`,
			},
		});
	} catch (error) {
		console.log(error);
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 404) {
				throw { code: 'USER_NOT_FOUND' };
			}
		}
		throw { code: 'USER_SERVICE_ERROR' };
	}

	await prisma.refreshToken.deleteMany({ where: { userId } });
	await prisma.passwordResetToken.deleteMany({ where: { userId } });
	await prisma.authUser.delete({
		where: { id: userId }
	});

};

export default deleteUser;
