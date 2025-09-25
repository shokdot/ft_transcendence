import { AppError } from "./AppError.js";

const extractToken = (authHeader?: string) => {
	if (!authHeader || !authHeader.startsWith('Bearer ')) throw new AppError('ACCESS_TOKEN_MISSING');

	const token = authHeader.split(' ')[1];
	if (!token) throw new AppError('ACCESS_TOKEN_MISSING');

	return token;
};

export default extractToken;
