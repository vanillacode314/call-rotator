import jwt from 'jsonwebtoken';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';

export async function getUser(token: string | null | undefined) {
	if (!token) return null;

	try {
		return GetSessionResponseV1Schema.shape.user.parse(jwt.verify(token, env.AUTH_SECRET));
	} catch (err) {
		return null;
	}
}
