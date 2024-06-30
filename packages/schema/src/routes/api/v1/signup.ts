import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';

const SignUpRequestV1Schema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters' })
		.refine(
			(value) => {
				return (
					/[a-z]/.test(value) &&
					/[A-Z]/.test(value) &&
					/[0-9]/.test(value) &&
					/[@$!%*?&]/.test(value)
				);
			},
			{
				message:
					'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'
			}
		)
});

const SignUpResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({ token: z.string() })
	}),
	ErrorResponseV1Schema
]);

export { SignUpRequestV1Schema, SignUpResponseV1Schema };
