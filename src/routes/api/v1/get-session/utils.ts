import { AUTH_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

export const getSession = async (token: string | null | undefined) => {
	if (!token) {
		return null;
	}

	try {
		return jwt.verify(token, AUTH_SECRET);
	} catch (err) {
		console.error(err);
		return null;
	}
};
