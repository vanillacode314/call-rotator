import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';

const SignInRequestV1Schema = z.object(
	{
		email: z.string({ required_error: 'Email is required' }).email(),
		password: z.string({ required_error: 'Password is required' })
	},
	{ required_error: 'Email and password are required' }
);

const SignInResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({ token: z.string() })
	}),
	ErrorResponseV1Schema
]);

export { SignInRequestV1Schema, SignInResponseV1Schema };
