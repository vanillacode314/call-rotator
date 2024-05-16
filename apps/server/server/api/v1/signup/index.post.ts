import bcrypt from 'bcrypt';
import { nodes, userSchema, users } from 'db/schema';
import { count, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '~/utils/db';
import { formDataSchema } from './schema';

export default defineEventHandler(async (event) => {
	const formData = await readFormData(event);
	const result = formDataSchema.safeParse(Object.fromEntries(formData.entries()));
	if (!result.success) {
		setResponseStatus(event, 400);
		return {
			success: false,
			errors: result.error.errors.map((error) => ({
				message: error.message,
				code: 'INVALID_CREDENTIALS'
			}))
		};
	}

	const { email, password } = result.data;

	const [row] = await db.select({ count: count() }).from(users).where(eq(users.email, email));
	if (row.count > 0) {
		setResponseStatus(event, 409);
		return {
			success: false,
			errors: [
				{
					message: 'Email already registered',
					code: 'EMAIL_ALREADY_REGISTERED'
				}
			]
		};
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await db.transaction(async (tx) => {
		const [user] = await tx
			.insert(users)
			.values({
				email,
				password: hashedPassword
			})
			.returning();

		await tx.insert(nodes).values({ name: 'root', id: 0, parentId: null, userId: user.id });
		return user;
	});

	const token = jwt.sign(userSchema.omit({ email: true, id: true }).parse(user), env.AUTH_SECRET, {
		expiresIn: 365 * 24 * 60 * 60
	});
	return { success: true, data: { token } };
});
