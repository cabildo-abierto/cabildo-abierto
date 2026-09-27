import 'dotenv/config';
import {env} from '#/lib/env.js';
import {setupKysely} from '#/setup.js';
import {R2Storage, type ObjectStorage} from '#/services/storage/storage.js';
import {reindexSearch} from '#/services/search/reindex.js';

async function main() {
    if (!env.DIRECT_URL) throw new Error('La reconstrucción requiere DIRECT_URL para mantener el bloqueo durante todo el proceso.');
    const database = setupKysely(env.DIRECT_URL, 1);
    let storage: ObjectStorage | undefined;
    try {
        await reindexSearch(database, () => storage ??= new R2Storage(), console.log);
    } finally { await database.destroy(); }
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[redacted]') : 'Error desconocido';
    console.error(`Falló la reconstrucción de búsqueda: ${message}`);
    process.exitCode = 1;
});
