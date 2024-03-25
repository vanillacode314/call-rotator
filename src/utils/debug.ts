function d<T>(arg: T, meta: unknown = ''): T {
	if (meta) {
		return console.log(arg, meta), arg;
	} else {
		return console.log(arg), arg;
	}
}

export { d };
