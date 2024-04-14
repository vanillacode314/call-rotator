import { nodes, sessions, users } from '$/lib/db/schema.libsql';
import { json, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { count, eq } from 'drizzle-orm';
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
	if (row.count > 0) {
		return json(
			{
				success: false,
				errors: [
					{
						message: 'Email already registered',
						code: 'EMAIL_ALREADY_REGISTERED'
					}
				]
			},
			{ status: 409 }
		);
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const token = await db.transaction(async (tx) => {
		const [user] = await tx
			.insert(users)
			.values({
				email,
				password: hashedPassword
			})
			.returning({ id: users.id });

		await tx
			.insert(nodes)
			.values({ name: 'root', id: 0, parent_id: null, userId: user.id, metadata: null });

		const [session] = await tx
			.insert(sessions)
			.values({
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
				userId: user.id,
				token: Math.random().toString(36).substring(2)
			})
			.returning({ token: sessions.token });

		return session.token;
	});

	event.cookies.set('sessionToken', token, {
		path: '/',
		secure: true,
		httpOnly: true,
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	});

	return redirect(307, '/');
}) satisfies RequestHandler;
