import jwt from "jsonwebtoken";
import JwtType from "../types/jwtType.js";

export const signJwt = (payload: object, type: JwtType): string => {
	let expiresIn: jwt.SignOptions['expiresIn'];
	let secret: jwt.Secret;

	switch (type) {
		case JwtType.ACCESS:
			expiresIn = '15m';
			secret = process.env.JWT_SECRET!;
			break;
		case JwtType.REFRESH:
			expiresIn = '7d';
			secret = process.env.JWT_REFRESH_SECRET!;
			break;
		case JwtType.TWO_FA:
			expiresIn = '5m';
			secret = process.env.JWT_TWO_FA!;
			break;
	}

	return jwt.sign(payload, secret, { expiresIn });
};


export function verifyJwt(token: string, type: JwtType): any {
	try {
		let secret: jwt.Secret;

		switch (type) {
			case JwtType.ACCESS:
				secret = process.env.JWT_SECRET!;
				break;
			case JwtType.REFRESH:
				secret = process.env.JWT_REFRESH_SECRET!;
				break;
			case JwtType.TWO_FA:
				secret = process.env.JWT_TWO_FA!;
				break;
		}

		return jwt.verify(token, secret);
	} catch (err) {
		return null;
	}
}
