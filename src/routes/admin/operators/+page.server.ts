import { count, desc, eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { requireAdmin } from '$lib/server/crm/access';
import { operatorFormSchema, readFormData } from '$lib/server/crm/forms';
import { db } from '$lib/server/db';
import { appointment, auditLog, user } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const operators = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt,
			appointmentsCount: count(appointment.id)
		})
		.from(user)
		.leftJoin(appointment, eq(appointment.operatorId, user.id))
		.where(eq(user.role, 'operator'))
		.groupBy(user.id)
		.orderBy(desc(user.createdAt));

	return {
		operators: operators.map((operator) => ({
			...operator,
			createdAtFormatted: new Intl.DateTimeFormat('ru-RU', {
				dateStyle: 'medium',
				timeStyle: 'short'
			}).format(operator.createdAt)
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
		const parsed = operatorFormSchema.safeParse(readFormData(await request.formData()));

		if (!parsed.success) {
			return fail(400, {
				error: parsed.error.issues[0]?.message ?? 'Проверьте данные оператора'
			});
		}

		try {
			const created = await auth.api.createUser({
				body: {
					name: parsed.data.name,
					email: parsed.data.email,
					password: parsed.data.password
				}
			});

			await db.insert(auditLog).values({
				actorId: currentUser.id,
				entityType: 'user',
				entityId: created.user.id,
				action: 'create_operator'
			});
		} catch {
			return fail(400, {
				error: 'Не удалось создать оператора. Возможно, email уже используется.'
			});
		}

		throw redirect(303, '/admin/operators');
	}
};
