import { contactMetadataSchema } from '$/types/contact';
import { parseMetadata } from '$/utils/types';
import { getRawSQLocalClient } from '../sqlocal.client';
import { query as nodesQuery } from './nodes';

const query = {
	getContactsById(id: number) {
		return nodesQuery.getChildrenById(id, { pattern: '%.contacts' });
	},
	getContactsByPath(path: string) {
		return nodesQuery.getChildrenByPath(path, { pattern: '%.contacts' });
	},
	async getContactsByIdsAndPhone(contacts: TListMetadata['contacts']) {
		if (contacts.length === 0) return [];
		const nodeIdToPhonesMap = new Map(
			contacts.map((contact) => [contact.nodeId, new Set(contact.phones)])
		);

		const listNodes = await nodesQuery.getNodesByIds(contacts.map((contact) => contact.nodeId));
		const contactNodes = listNodes.map((node) => parseMetadata(node, contactMetadataSchema));
		const retval: (TContact & { nodeId: TNode['id'] })[] = [];
		for (const contactNode of contactNodes) {
			for (const contact of contactNode.metadata.contacts) {
				if (nodeIdToPhonesMap.get(contactNode.id)!.has(contact.phone))
					retval.push(Object.assign(contact, { nodeId: contactNode.id }));
			}
		}
		return retval;
	}
};

const mutations = {
	async removeContact(id: number) {
		const dbx = await getRawSQLocalClient();

		// Remove this contact from lists using phone numbers from this contact
		await dbx.transaction((sql) => [
			sql`
					UPDATE nodes
						SET metadata = JSON_SET(metadata, '$.contacts', JSON_REMOVE(metadata->'contacts', c.fullKey))
					FROM (SELECT fullKey, CAST(value->'nodeId' AS int) AS nodeId FROM nodes, JSON_EACH(nodes.metadata->'contacts')) AS c
						WHERE c.nodeId = ${id} AND nodes.name LIKE '%.list'
				`,
			sql`DELETE FROM nodes WHERE id = ${id}`
		]);
	},
	async removePhones(nodeId: number, phones: string[]) {
		const dbx = await getRawSQLocalClient();

		// Remove this contact from lists using phone numbers from this contact
		await dbx.transaction((sql) => [
			// @ts-ignore: it works
			sql([
				`
						UPDATE nodes
							SET metadata = JSON_SET(metadata, CONCAT('$.contacts', phone.contactIndex, '.phones'), JSON_REMOVE(JSON_EXTRACT(metadata, CONCAT('$.contacts', phone.contactIndex, '.phones')), CONCAT('$', phone.phoneIndex)))
						FROM (
							SELECT SUBSTR(contact.fullKey, 2) AS contactIndex, SUBSTR(JSON_EACH.fullKey, 2) AS phoneIndex, JSON_EACH.value FROM nodes, (
								SELECT fullKey, JSON_EACH.value FROM nodes, JSON_EACH(nodes.metadata->'contacts')
							) AS contact, JSON_EACH(contact.value->'phones')
						) AS phone
							WHERE nodes.name LIKE '%.list' AND phone.value IN (${phones.map((p) => `'${p}'`).join(',')}) 
				`
			]),
			// @ts-ignore: it works
			sql([
				`
						UPDATE nodes
							SET metadata = JSON_SET(metadata, '$.contacts', JSON_REMOVE(metadata->'contacts', CONCAT('$', contact.path)))
						FROM (
							SELECT SUBSTR(JSON_EACH.fullKey, 2) AS path, JSON_EACH.value, JSON_EACH.value->>'phone' AS phone FROM nodes, JSON_EACH(nodes.metadata->'contacts')
						) AS contact 
							WHERE nodes.id = ${nodeId} AND phone IN (${phones.map((p) => `'${p}'`).join(',')})`
			])
		]);
	}
};

export { mutations, query };
