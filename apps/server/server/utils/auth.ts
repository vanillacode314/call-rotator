import jwt from 'jsonwebtoken';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';
import z from 'zod';

export async function getUser(header: string | null | undefined) {
	if (!header) return null;
	const token = header.slice(7);
	if (!token) return null;

	try {
		return jwt.verify(token, env.AUTH_SECRET) as z.TypeOf<
			typeof GetSessionResponseV1Schema.shape.user
		>;
	} catch (err) {
		return null;
	}
}
