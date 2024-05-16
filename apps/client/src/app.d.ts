// See https://kit.svelte.dev/docs/types#app
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: null | Omit<TUser | 'password'>;
			db: LibSQLDatabase<Record<string, never>>;
		}
		interface PageData {
			user: null | Omit<TUser | 'password'>;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
