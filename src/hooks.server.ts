import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = env.DATABASE_URL
		? await auth.api.getSession({
				headers: event.request.headers
			})
		: null;

	if (session) {
		const role = session.user.role === 'admin' ? 'admin' : 'operator';

		event.locals.session = session.session;
		event.locals.user = {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			role
		};
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
