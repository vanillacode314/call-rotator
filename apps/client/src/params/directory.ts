import type { ParamMatcher } from '@sveltejs/kit';

const match: ParamMatcher = (param) =>
	(param === '' || !/^[\w\s/-]+\.[\w\s]+$/.test(param)) && !param.startsWith('api/');
export { match };
