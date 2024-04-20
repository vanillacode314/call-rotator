import { sessions, users } from '$/lib/db/schema.libsql';
import { eq } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

export const getSession = async (token: string | null | undefined, db: LibSQLDatabase) => {
	if (!token) {
		return null;
	}

	const [user] = await db
		.select({ id: users.id, email: users.email })
		.from(sessions)
		.leftJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.token, token));

	return user ?? null;
};
