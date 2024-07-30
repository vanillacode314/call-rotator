import { getContacts } from 'db/queries/v1/contacts/index';
export default defineEventHandler(async (event) => {
	const page = Number(getQuery(event).page || 1);
	const itemsPerPage = Number(getQuery(event).itemsPerPage || 20);
	return getContacts(db, event.context.user.id, { page, itemsPerPage });
});
