function join(...parts: string[]) {
	if (parts[0] === '/') {
		return '/' + parts.slice(1).filter(Boolean).join('/');
	}
	return parts.join('/');
}

function compressPath(path: string) {
	if (path === '/') return '/';
	const parts = path.split('/').filter(Boolean);
	const last = parts.pop();
	return parts.map((p) => p.substring(0, 1)).join('/') + '/' + last;
}

export { compressPath, join };
