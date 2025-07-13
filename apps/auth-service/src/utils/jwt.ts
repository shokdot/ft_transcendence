import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dev-key"; // ✅ use env in production
const JWT_EXPIRES_IN = "7d"; // Token validity duration

export function signJwt(payload: object): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): any {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (err) {
		return null;
	}
}
