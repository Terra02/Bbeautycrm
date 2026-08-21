import { desc, eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { requireAdmin } from '$lib/server/crm/access';
import { adminFormSchema, readFormData } from '$lib/server/crm/forms';
import { db } from '$lib/server/db';
import { auditLog, user } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const admins = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt
		})
		.from(user)
		.where(eq(user.role, 'admin'))
		.orderBy(desc(user.createdAt));

	return {
		admins: admins.map((admin) => ({
			...admin,
			createdAtFormatted: new Intl.DateTimeFormat('ru-RU', {
				dateStyle: 'medium',
				timeStyle: 'short'
			}).format(admin.createdAt)
		}))
	};
};

export const actions: Actions = {
	logout: async ({ request, locals }) => {
		requireAdmin(locals);

		await auth.api.signOut({
			headers: request.headers
		});

		throw redirect(303, '/login');
	},
	create: async ({ request, locals }) => {
		const currentUser = requireAdmin(locals);
		const parsed = adminFormSchema.safeParse(readFormData(await request.formData()));

		if (!parsed.success) {
			return fail(400, {
				error: parsed.error.issues[0]?.message ?? 'Проверьте данные администратора'
			});
		}

		try {
			const created = await auth.api.createUser({
				body: {
					name: parsed.data.name,
					email: parsed.data.email,
					password: parsed.data.password,
					role: 'admin'
				}
			});

			await db.insert(auditLog).values({
				actorId: currentUser.id,
				entityType: 'user',
				entityId: created.user.id,
				action: 'create_admin'
			});
		} catch {
			return fail(400, {
				error: 'Не удалось создать администратора. Возможно, email уже используется.'
			});
		}

		throw redirect(303, '/admin/admins');
	}
};

