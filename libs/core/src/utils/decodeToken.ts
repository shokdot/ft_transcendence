import JwtType from '../types/jwtType.js';
import { verifyJwt } from './jwt.js';
import { AppError } from './AppError.js';

const decodeToken = (token: string) => {
	const decoded = verifyJwt(token, JwtType.ACCESS);
	if (!decoded) throw new AppError('INVALID_ACCESS_TOKEN');

	return decoded.sub;
};


export default decodeToken;
