import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { hashPassword } from 'better-auth/crypto';

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? 'Администратор';

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required');
}

if (!email || !password) {
	throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
}

if (password.length < 8) {
	throw new Error('ADMIN_PASSWORD must be at least 8 characters');
}

const pool = new Pool({
	connectionString: databaseUrl
});

let client;

try {
	client = await pool.connect();
	await client.query('begin');

	const existing = await client.query('select id from "user" where email = $1 limit 1', [email]);
	const userId = existing.rows[0]?.id ?? randomUUID();
	const now = new Date();

	if (existing.rowCount === 0) {
		await client.query(
			`insert into "user"
				(id, name, email, email_verified, image, role, banned, created_at, updated_at)
			 values ($1, $2, $3, true, null, 'admin', false, $4, $4)`,
			[userId, name, email, now]
		);
	} else {
		await client.query(
			`update "user"
			 set role = 'admin', name = $2, updated_at = $3
			 where id = $1`,
			[userId, name, now]
		);
	}

	const hashedPassword = await hashPassword(password);
	const accountId = randomUUID();

	await client.query(
		`delete from account
		 where user_id = $1 and provider_id = 'credential' and issuer = 'local:credential'`,
		[userId]
	);

	await client.query(
		`insert into account
			(id, account_id, provider_id, issuer, user_id, password, created_at, updated_at)
		 values ($1, $2, 'credential', 'local:credential', $2, $3, $4, $4)
		 `,
		[accountId, userId, hashedPassword, now]
	);

	await client.query('commit');
	console.log(`Admin account is ready: ${email}`);
} catch (error) {
	if (client) {
		await client.query('rollback');
	}

	if (error?.code === '28P01') {
		console.error(
			'PostgreSQL rejected DATABASE_URL credentials. Check the username and password in .env.'
		);
		console.error('Example: DATABASE_URL="postgres://postgres:your_password@localhost:5432/beauty_crm"');
		process.exitCode = 1;
	} else if (error?.code === '3D000') {
		console.error('Database does not exist. Create the database from DATABASE_URL, then run migrations.');
		process.exitCode = 1;
	} else if (error?.code === '42P01') {
		console.error('Database tables are missing. Run `npm run db:migrate`, then run `npm run seed:admin`.');
		process.exitCode = 1;
	} else if (error?.code === 'ECONNREFUSED') {
		console.error('PostgreSQL is not running or DATABASE_URL points to the wrong host/port.');
		process.exitCode = 1;
	} else {
		throw error;
	}
} finally {
	client?.release();
	await pool.end();
}
