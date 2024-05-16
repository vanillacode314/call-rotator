import bcrypt from 'bcrypt';
import { userSchema, users } from 'db/schema';
import { count, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { SignInResponseV1 } from 'proto/api/v1/signin';
import { ErrorCode } from 'proto/response';
import { db } from '~/utils/db';
import { formDataSchema } from './schema';

export default defineEventHandler(async (event) => {
	const formData = await readFormData(event);
	const result = formDataSchema.safeParse(Object.fromEntries(formData.entries()));
	if (!result.success) {
		setResponseStatus(event, 400);
		return SignInResponseV1.toBinary({
			result: {
				oneofKind: 'errors',
				errors: {
					errors: result.error.errors.map((error) => ({
						message: error.message,
						code: ErrorCode.INVALID_CREDENTIALS
					}))
				}
			}
		});
	}

	const { email, password } = result.data;
	const [row] = await db.select({ count: count() }).from(users).where(eq(users.email, email));
	if (row.count !== 1) {
		setResponseStatus(event, 401);
		return SignInResponseV1.toBinary({
			result: {
				oneofKind: 'errors',
				errors: {
					errors: [{ message: 'Invalid email or password', code: ErrorCode.INVALID_CREDENTIALS }]
				}
			}
		});
	}

	const [user] = await db.select().from(users);
	if (!(await bcrypt.compare(password, user.password))) {
		setResponseStatus(event, 401);
		return SignInResponseV1.toBinary({
			result: {
				oneofKind: 'errors',
				errors: {
					errors: [
						{
							message: 'Invalid email or password',
							code: ErrorCode.INVALID_CREDENTIALS
						}
					]
				}
			}
		});
	}

	const token = jwt.sign(userSchema.pick({ email: true, id: true }).parse(user), env.AUTH_SECRET, {
		expiresIn: 365 * 24 * 60 * 60
	});
	return SignInResponseV1.toBinary({ result: { oneofKind: 'data', data: { token } } });
});
