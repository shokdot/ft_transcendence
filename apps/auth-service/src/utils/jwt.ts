import jwt from "jsonwebtoken";
import JwtType from "../types/jwtType.js";

export const signJwt = (payload: object, type: JwtType): string => {
	let expiresIn: jwt.SignOptions['expiresIn'];
	let secret: jwt.Secret;

	switch (type) {
		case JwtType.ACCESS:
			// expiresIn = '15m';
			expiresIn = '7d';
			secret = process.env.JWT_SECRET;
			break;
		case JwtType.REFRESH:
			expiresIn = '7d';
			secret = process.env.JWT_REFRESH_SECRET;
			break;
	}

	return jwt.sign(payload, secret, { expiresIn });
};


// export function verifyJwt(token: string): any {
// 	try {
// 		return jwt.verify(token, JWT_SECRET);
// 	} catch (err) {
// 		return null;
// 	}
// }
