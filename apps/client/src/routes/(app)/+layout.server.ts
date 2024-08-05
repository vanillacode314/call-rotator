export const load: LayoutServerLoad = async (event) => {
	return { user: event.locals.user };
};
