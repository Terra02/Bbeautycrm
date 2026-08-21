import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { loginFormSchema, readFormData } from '$lib/server/crm/forms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/dashboard');
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const parsed = loginFormSchema.safeParse(readFormData(await request.formData()));

		if (!parsed.success) {
			return fail(400, {
				error: parsed.error.issues[0]?.message ?? 'Проверьте email и пароль'
			});
		}

		try {
			await auth.api.signInEmail({
				body: {
					email: parsed.data.email,
					password: parsed.data.password,
					callbackURL: '/dashboard'
				},
				headers: request.headers
			});
		} catch {
			return fail(401, {
				error: 'Неверный email или пароль'
			});
		}

		throw redirect(303, '/dashboard');
	}
};

