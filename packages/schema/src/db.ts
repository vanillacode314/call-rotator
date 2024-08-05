import { z } from 'zod';

const timestamp = () => z.number().int().nonnegative();
const id = () => z.number().int().nonnegative();

const userSchema = z.object({
	id: id(),
	email: z.string().email(),
	password: z.string(),
	emailVerified: timestamp().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});

const verificationTokenSchema = z.object({
	token: z.string(),
	identifier: userSchema.shape.id,
	expires: z.coerce.date()
});

const nodeSchema = z.object({
	id: id(),
	name: z.string(),
	parentId: id().nullable(),
	listId: id().nullable(),
	userId: id(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deleted: z.boolean()
});

const listSchema = z.object({
	id: id(),
	cycleDurationDays: z.number().int().positive(),
	startDate: z.coerce.date(),
	userId: id(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deleted: z.boolean()
});

const contactSchema = z.object({
	id: id(),
	phone: z.string(),
	name: z.string(),
	notes: z.string(),
	tags: z.string().array().default(Array),
	userId: id(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deleted: z.boolean()
});

const listContactAssociationSchema = z.object({
	listId: id(),
	contactId: id(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deleted: z.boolean()
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
