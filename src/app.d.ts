// See https://kit.svelte.dev/docs/types#app
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: null | Pick<TUser | 'id' | 'password'>;
			mode: 'offline' | 'online';
			db: LibSQLDatabase<Record<string, never>>;
		}
		interface PageData {
			mode: 'offline' | 'online';
			user: null | Pick<TUser | 'id' | 'password'>;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
