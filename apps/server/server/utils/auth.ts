import jwt from 'jsonwebtoken';
import { GetSessionResponseV1_User } from 'proto/api/v1/get-session';

export async function getUser(header: string | null | undefined) {
	if (!header) return null;
	const token = header.slice(7);
	if (!token) return null;

	try {
		return jwt.verify(token, env.AUTH_SECRET) as GetSessionResponseV1_User;
	} catch (err) {
		return null;
	}
}
