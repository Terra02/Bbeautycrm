import { redirect } from '@sveltejs/kit';
import type { UserRole } from '$lib/server/db/schema';

export function requireUser(locals: App.Locals) {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	return {
		...locals.user,
		role: (locals.user.role ?? 'operator') as UserRole
	};
}

export function requireAdmin(locals: App.Locals) {
	const user = requireUser(locals);

	if (user.role !== 'admin') {
		throw redirect(303, '/dashboard');
	}

	return user;
}

