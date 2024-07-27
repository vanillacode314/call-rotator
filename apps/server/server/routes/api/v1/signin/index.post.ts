import bcrypt from 'bcrypt';
import { users } from 'db/schema';
import { count, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { ApiErrorCodeSchema } from 'schema/api';
import { userSchema } from 'schema/db';
import { SignInRequestV1Schema } from 'schema/routes/api/v1/signin';
import { db } from '~/utils/db';

export default defineEventHandler(async (event) => {
	console.log(100);
	const result = await readValidatedBody(event, SignInRequestV1Schema.safeParse);
	console.log(200, result);
	if (!result.success) {
		setResponseStatus(event, 400);
		return {
			status: 400,
			success: false,
			result: {
				issues: result.error.errors.map((error) => ({
					message: error.message,
					code: ApiErrorCodeSchema.enum.INVALID_CREDENTIALS
				}))
			}
		};
	}
	const { email, password } = result.data;
	console.log(300, { email, password });

	const [row] = await db.select({ count: count() }).from(users).where(eq(users.email, email));
	console.log(400, row);
	if (row.count !== 1) {
		setResponseStatus(event, 401);
		return {
			status: 401,
			success: false,
			result: {
				issues: [
					{
						message: 'Invalid email or password',
						code: ApiErrorCodeSchema.enum.INVALID_CREDENTIALS
					}
				]
			}
		};
	}

	const [user] = await db.select().from(users);
	if (!(await bcrypt.compare(password, user.password))) {
		setResponseStatus(event, 401);
		return {
			status: 401,
			success: false,
			result: {
				issues: [
					{
						message: 'Invalid email or password',
						code: ApiErrorCodeSchema.enum.INVALID_CREDENTIALS
					}
				]
			}
		};
	}

	const token = jwt.sign(userSchema.pick({ email: true, id: true }).parse(user), env.AUTH_SECRET, {
		expiresIn: 365 * 24 * 60 * 60
	});
	return { success: true, status: 200, result: { token } };
});
