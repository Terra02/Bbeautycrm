import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['admin', 'operator']);
export const appointmentStatus = pgEnum('appointment_status', [
	'new',
	'confirmed',
	'completed',
	'cancelled'
]);

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	role: userRole('role').notNull().default('operator'),
	banned: boolean('banned').default(false),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		impersonatedBy: text('impersonated_by'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => ({
		userIdIdx: index('session_user_id_idx').on(table.userId)
	})
);

export const account = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		issuer: text('issuer'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull()
	},
	(table) => ({
		userIdIdx: index('account_user_id_idx').on(table.userId)
	})
);

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const service = pgTable('service', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 120 }).notNull(),
	category: varchar('category', { length: 80 }).notNull(),
	durationMinutes: integer('duration_minutes').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const location = pgTable('location', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 160 }).notNull(),
	address: text('address'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const appointment = pgTable(
	'appointment',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		clientName: varchar('client_name', { length: 160 }).notNull(),
		clientPhone: varchar('client_phone', { length: 40 }),
		appointmentTime: timestamp('appointment_time').notNull(),
		status: appointmentStatus('status').notNull().default('new'),
		sourceText: text('source_text').notNull(),
		notes: text('notes'),
		serviceId: uuid('service_id')
			.notNull()
			.references(() => service.id),
		locationId: uuid('location_id')
			.notNull()
			.references(() => location.id),
		operatorId: text('operator_id')
			.notNull()
			.references(() => user.id),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		operatorIdIdx: index('appointment_operator_id_idx').on(table.operatorId),
		appointmentTimeIdx: index('appointment_time_idx').on(table.appointmentTime)
	})
);

export const auditLog = pgTable(
	'audit_log',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		actorId: text('actor_id').references(() => user.id),
		entityType: varchar('entity_type', { length: 80 }).notNull(),
		entityId: text('entity_id').notNull(),
		action: varchar('action', { length: 80 }).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		actorIdIdx: index('audit_log_actor_id_idx').on(table.actorId)
	})
);

export const userRelations = relations(user, ({ many }) => ({
	appointments: many(appointment),
	auditEvents: many(auditLog)
}));

export const appointmentRelations = relations(appointment, ({ one }) => ({
	operator: one(user, {
		fields: [appointment.operatorId],
		references: [user.id]
	}),
	service: one(service, {
		fields: [appointment.serviceId],
		references: [service.id]
	}),
	location: one(location, {
		fields: [appointment.locationId],
		references: [location.id]
	})
}));

export type UserRole = (typeof userRole.enumValues)[number];
export type AppointmentStatus = (typeof appointmentStatus.enumValues)[number];
