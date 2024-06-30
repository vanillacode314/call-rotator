import { z } from 'zod';

const ApiErrorCodeSchema = z.enum([
	'ERROR_UNSPECIFIED',
	'INVALID_CREDENTIALS',
	'INVALID_FORMDATA',
	'INVALID_QUERY',
	'EMAIL_ALREADY_REGISTERED',
	'NOT_FOUND',
	'INVALID_PATH',
	'CONFLICT',
	'INTERNAL_SERVER_ERROR',
	'UNAUTHORIZED',
	'BAD_REQUEST'
]);

const IssueSchema = z.object({
	code: ApiErrorCodeSchema.default('ERROR_UNSPECIFIED'),
	message: z.string()
});

const ApiErrorSchema = z.object({
	issues: IssueSchema.array()
});

const ErrorResponseV1Schema = z.object({
	status: z.number().default(500),
	success: z.literal(false),
	result: ApiErrorSchema
});

type TIssue = z.TypeOf<typeof IssueSchema>;
type TApiError = z.TypeOf<typeof ApiErrorSchema>;
type TApiErrorCode = z.TypeOf<typeof ApiErrorCodeSchema>;
type TApiErrorResult = z.TypeOf<typeof ErrorResponseV1Schema>;

export { ApiErrorCodeSchema, ApiErrorSchema, ErrorResponseV1Schema, IssueSchema };
export type { TApiError, TApiErrorCode, TApiErrorResult, TIssue };
