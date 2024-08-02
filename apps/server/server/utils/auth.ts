import jwt from 'jsonwebtoken';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';

export async function getUser(header: string | null | undefined) {
	if (!header) return null;
	const token = header.slice(7);
	if (!token) return null;

	try {
		return GetSessionResponseV1Schema.shape.user.parse(jwt.verify(token, env.AUTH_SECRET));
	} catch (err) {
		return null;
	}
}
