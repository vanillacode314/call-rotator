import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	if (param.startsWith('api/')) return false;
	return param === '' || !/^[\w\s/-]+\.[\w\s]+$/.test(param);
};
