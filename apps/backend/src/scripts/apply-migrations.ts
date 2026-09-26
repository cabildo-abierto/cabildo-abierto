import 'dotenv/config';
import {existsSync} from 'node:fs';
import {readdir, readFile} from 'node:fs/promises';
import pg from 'pg';

const schemaDirectory = new URL('../../schema/', import.meta.url);

async function loadMigrations() {
    const directory = new URL('migrations/', schemaDirectory);
    const names = (await readdir(directory)).filter(name => name.endsWith('.sql')).sort();
    if (!names.length) throw new Error('No migrations found.');
    let origin = 'empty';
    return Promise.all(names.map(async (name, index) => {
        const match = /^(\d{4})_([a-z][a-z0-9_]*?)_(empty|[1-9]\d*)_([1-9]\d*)\.sql$/.exec(name);
        if (!match || Number(match[1]) !== index + 1 || match[3] !== origin || Number(match[4]) !== index + 1) {
            throw new Error(`Invalid migration sequence: ${name}`);
        }
        origin = match[4];
        const sql = (await readFile(new URL(name, directory), 'utf8')).trim();
        if (!sql) throw new Error(`Empty migration: ${name}`);
        if (!existsSync(new URL(`schemas/schema_${match[4]}.sql`, schemaDirectory))) {
            throw new Error(`Missing schema snapshot for ${name}`);
        }
        return {name, sql};
    }));
}

async function appliedMigrations(client: pg.Client, names: string[]) {
    const table = await client.query("SELECT to_regclass('public.migration') AS name");
    if (!table.rows[0].name) return new Set<string>();
    const result = await client.query<{file_name: string}>('SELECT file_name FROM public.migration ORDER BY file_name');
    const applied = result.rows.map(row => row.file_name);
    if (applied.some((name, index) => name !== names[index])) {
        throw new Error('Database migration history does not match the local migration sequence.');
    }
    return new Set(applied);
}

async function main() {
    const migrations = await loadMigrations();
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error('Missing DIRECT_URL or DATABASE_URL.');
    const client = new pg.Client({connectionString});
    await client.connect();
    let count = 0;
    try {
        for (const migration of migrations) {
            await client.query('BEGIN');
            try {
                // Transaction-scoped: safe when connecting through a transaction pooler.
                await client.query('SELECT pg_advisory_xact_lock(194827, 1)');
                const applied = await appliedMigrations(client, migrations.map(item => item.name));
                if (!applied.has(migration.name)) {
                    console.log(`Applying ${migration.name}`);
                    await client.query(migration.sql);
                    await client.query('INSERT INTO public.migration (run_date, file_name) VALUES (now(), $1)', [migration.name]);
                    count++;
                }
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }
        console.log(count ? `Applied ${count} migration(s).` : 'Database is up to date.');
    } finally {
        await client.end();
    }
}

main().catch((error: unknown) => {
    // Do not print connection strings or driver configuration.
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Migration failed: ${message.replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[redacted]')}`);
    process.exitCode = 1;
});
