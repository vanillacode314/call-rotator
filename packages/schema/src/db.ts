import { z } from 'zod';

const timestamp = () => z.number().int().nonnegative();
const id = () => z.number().int().nonnegative();

const userSchema = z.object({
	id: id(),
	email: z.string().email(),
	password: z.string(),
	emailVerified: timestamp().nullable(),
	createdAt: timestamp(),
	updatedAt: timestamp()
});

const verificationTokenSchema = z.object({
	token: z.string(),
	identifier: userSchema.shape.id,
	expires: z.date()
});

const nodeSchema = z.object({
	id: id(),
	name: z.string(),
	parentId: id().nullable(),
	listId: id().nullable(),
	userId: id(),
	createdAt: z.date(),
	updatedAt: z.date()
});

const listSchema = z.object({
	id: id(),
	cycleDurationDays: z.number().int().positive(),
	startDate: z.date(),
	userId: id(),
	createdAt: z.date(),
	updatedAt: z.date()
});

const contactSchema = z.object({
	id: id(),
	phone: z.string(),
	name: z.string(),
	notes: z.string(),
	tags: z.string().array().default(Array),
	userId: id(),
	createdAt: z.date(),
	updatedAt: z.date()
});

const listContactAssociationSchema = z.object({
	listId: id(),
	contactId: id()
});

export {
	contactSchema,
	listContactAssociationSchema,
	listSchema,
	nodeSchema,
	userSchema,
	verificationTokenSchema
};

type TNode = z.TypeOf<typeof nodeSchema>;
type TList = z.TypeOf<typeof listSchema>;
type TContact = z.TypeOf<typeof contactSchema>;
type TUser = z.TypeOf<typeof userSchema>;
type TListContact = z.TypeOf<typeof listContactAssociationSchema>;

export type { TContact, TList, TListContact, TNode, TUser };
