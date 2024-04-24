import { userSchema, users } from '$/lib/db/schema.libsql';
import { AUTH_SECRET } from '$env/static/private';
import { json, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { count, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import type { RequestHandler } from './$types';
import { formDataSchema } from './schema';

export const POST = (async (event) => {
	const formData = await event.request.formData();
	const result = formDataSchema.safeParse(Object.fromEntries(formData.entries()));
	if (!result.success) {
		return json(
			{
				success: false,
				errors: result.error.errors.map((error) => ({
					message: error.message,
					code: 'INVALID_CREDENTIALS'
				}))
			},
			{ status: 400 }
		);
	}

	const { email, password } = result.data;

	const db = event.locals.db;
	const [row] = await db.select({ count: count() }).from(users).where(eq(users.email, email));
	if (row.count !== 1) {
		return json(
			{
				success: false,
				errors: [
					{
						message: 'Invalid email or password',
						code: 'INVALID_CREDENTIALS'
					}
				]
			},
			{ status: 401 }
		);
	}

	const [user] = await db.select().from(users);
	if (!(await bcrypt.compare(password, user.password))) {
		return json(
			{
				success: false,
				errors: [
					{
						message: 'Invalid email or password',
						code: 'INVALID_CREDENTIALS'
					}
				]
			},
			{ status: 401 }
		);
	}

	const token = jwt.sign(userSchema.omit({ password: true }).parse(user), AUTH_SECRET, {
		expiresIn: 365 * 24 * 60 * 60
	});
	event.cookies.set('jwtToken', token, {
		path: '/',
		secure: true,
		httpOnly: true,
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	});

	return redirect(307, '/');
}) satisfies RequestHandler;
