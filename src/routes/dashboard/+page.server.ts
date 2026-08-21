import { and, count, desc, eq, gte } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { appointment, auditLog, location, service, user } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/crm/access';
import { appointmentFormSchema, readFormData } from '$lib/server/crm/forms';
import type { Actions, PageServerLoad } from './$types';

const statusLabels = {
	new: 'Новая',
	confirmed: 'Подтверждена',
	completed: 'Завершена',
	cancelled: 'Отменена'
} as const;

function startOfToday() {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
}

async function findOrCreateService(name: string) {
	const existing = await db.query.service.findFirst({
		where: eq(service.name, name)
	});

	if (existing) return existing;

	const [created] = await db
		.insert(service)
		.values({
			name,
			category: 'Салон красоты',
			durationMinutes: 60
		})
		.returning();

	return created;
}

async function findOrCreateLocation(name: string) {
	const existing = await db.query.location.findFirst({
		where: eq(location.name, name)
	});

	if (existing) return existing;

	const [created] = await db
		.insert(location)
		.values({
			name
		})
		.returning();

	return created;
}

export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = requireUser(locals);
	const isAdmin = currentUser.role === 'admin';
	const visibilityWhere = isAdmin ? undefined : eq(appointment.operatorId, currentUser.id);
	const todayWhere = isAdmin
		? gte(appointment.appointmentTime, startOfToday())
		: and(eq(appointment.operatorId, currentUser.id), gte(appointment.appointmentTime, startOfToday()));

	const rows = await db
		.select({
			id: appointment.id,
			clientName: appointment.clientName,
			clientPhone: appointment.clientPhone,
			appointmentTime: appointment.appointmentTime,
			status: appointment.status,
			sourceText: appointment.sourceText,
			notes: appointment.notes,
			service: service.name,
			location: location.name,
			operator: user.name
		})
		.from(appointment)
		.innerJoin(service, eq(appointment.serviceId, service.id))
		.innerJoin(location, eq(appointment.locationId, location.id))
		.innerJoin(user, eq(appointment.operatorId, user.id))
		.where(visibilityWhere)
		.orderBy(desc(appointment.appointmentTime));

	const [todayCount] = await db
		.select({ value: count() })
		.from(appointment)
		.where(todayWhere);

	const [newCount] = await db
		.select({ value: count() })
		.from(appointment)
		.where(isAdmin ? eq(appointment.status, 'new') : and(eq(appointment.operatorId, currentUser.id), eq(appointment.status, 'new')));

	const [operatorCount] = await db
		.select({ value: count() })
		.from(user)
		.where(eq(user.role, 'operator'));

	return {
		role: currentUser.role,
		userName: currentUser.name,
		metrics: {
			today: todayCount?.value ?? 0,
			new: newCount?.value ?? 0,
			operators: operatorCount?.value ?? 0
		},
		appointments: rows.map((item) => ({
			...item,
			time: new Intl.DateTimeFormat('ru-RU', {
				dateStyle: 'medium',
				timeStyle: 'short'
			}).format(item.appointmentTime),
			statusLabel: statusLabels[item.status]
		}))
	};
};

export const actions: Actions = {
	logout: async ({ request, locals }) => {
		requireUser(locals);

		await auth.api.signOut({
			headers: request.headers
		});

		throw redirect(303, '/login');
	},
	create: async ({ request, locals }) => {
		const currentUser = requireUser(locals);
		const parsed = appointmentFormSchema.safeParse(readFormData(await request.formData()));

		if (!parsed.success) {
			return fail(400, {
				error: parsed.error.issues[0]?.message ?? 'Проверьте данные записи'
			});
		}

		const appointmentTime = new Date(parsed.data.appointmentTime);
		if (Number.isNaN(appointmentTime.getTime())) {
			return fail(400, {
				error: 'Укажите корректную дату и время'
			});
		}

		const [crmService, crmLocation] = await Promise.all([
			findOrCreateService(parsed.data.serviceName),
			findOrCreateLocation(parsed.data.locationName)
		]);
		const sourceText = [
			parsed.data.clientName,
			parsed.data.clientPhone,
			parsed.data.serviceName,
			parsed.data.appointmentTime,
			parsed.data.locationName,
			parsed.data.notes
		]
			.filter(Boolean)
			.join(', ');

		const [created] = await db
			.insert(appointment)
			.values({
				clientName: parsed.data.clientName,
				clientPhone: parsed.data.clientPhone || null,
				appointmentTime,
				sourceText,
				notes: parsed.data.notes || null,
				serviceId: crmService.id,
				locationId: crmLocation.id,
				operatorId: currentUser.id
			})
			.returning({ id: appointment.id });

		await db.insert(auditLog).values({
			actorId: currentUser.id,
			entityType: 'appointment',
			entityId: created.id,
			action: 'create'
		});

		throw redirect(303, '/dashboard');
	}
};
