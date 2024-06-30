// @unocss-include
const VALID_FILETYPES = ['.list'] as const;
const ROOT_NODE_ID = 0;
const DEFAULT_LOCAL_USER_ID = 0;
const RESERVED_FILE_NAMES = ['settings', 'dashboard', 'contacts'] as const;
const RESERVED_FILE_DATA_MAP = {
	settings: { icon: 'i-mdi:cog', url: '/settings' },
	dashboard: { icon: 'i-mdi:view-dashboard', url: '/dashboard' },
	contacts: { icon: 'i-mdi:person', url: '/contacts' }
} satisfies Record<(typeof RESERVED_FILE_NAMES)[number], { icon: string; url: string }>;

export {
	DEFAULT_LOCAL_USER_ID,
	RESERVED_FILE_DATA_MAP,
	RESERVED_FILE_NAMES,
	ROOT_NODE_ID,
	VALID_FILETYPES
};
