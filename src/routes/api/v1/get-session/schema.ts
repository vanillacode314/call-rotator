import { userSchema } from '$/lib/db/schema.libsql';
import { z } from 'zod';

const responseSchema = z.object({ data: userSchema.pick({ email: true, id: true }).nullable() });

export { responseSchema };
