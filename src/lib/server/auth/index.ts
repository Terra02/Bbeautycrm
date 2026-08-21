import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET ?? 'dev-only-change-this-secret-before-production',
	baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5173',
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	emailAndPassword: {
		enabled: true
	},
	plugins: [
		admin({
			defaultRole: 'operator',
			adminRoles: ['admin']
		}),
		sveltekitCookies(getRequestEvent)
	]
});
