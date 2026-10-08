import {S3Client} from '@aws-sdk/client-s3';
import pg from 'pg';
import {interactivePrompts} from './lib/interactive.js';
import {referencedInventory, copyR2Bucket, copyR2ToGarage, sameObject, type BucketInventory} from './lib/copy-r2-bucket.js';

async function main() {
    const args = process.argv.slice(2);
    if (args.some(arg => !['--dry-run', '--garage', '--prod', '--help'].includes(arg)) || new Set(args).size !== args.length) throw new Error('Uso: pnpm --filter backend script:copy-r2-to-dev [--garage] [--prod] [--dry-run]');
    if (args.includes('--help')) {console.log('Uso: pnpm --filter backend script:copy-r2-to-dev [--garage] [--prod] [--dry-run]'); return;}
    const garage = args.includes('--garage');
    const environment = args.includes('--prod') ? 'PRODUCCIÓN' : 'DESARROLLO';
    const prompts = interactivePrompts();
    let storage: S3Client | undefined;
    let database: pg.Client | undefined;
    let targetStorage: S3Client | undefined;
    try {
        console.log(`Copia de R2 a ${garage ? 'Garage' : 'R2'}: objetos referenciados por la base de ${environment}.`);
        console.log('Detené las escrituras al origen y al destino y el backend/workers de este ambiente hasta terminar el cambio de configuración.');
        if (!garage) console.log('Si hay archivos privados, desactivá la URL pública r2.dev del destino antes de copiar.');
        const account = await prompts.ask('Cloudflare Account ID (el valor de CLOUDFLARE_ACCOUNT_ID en apps/backend/.env)');
        const source = await prompts.ask('Nombre del bucket de origen');
        const destination = await prompts.ask(`Nombre del bucket de ${environment} de destino`);
        if (!/^[a-f0-9]{32}$/i.test(account)) throw new Error('El Account ID debe tener 32 caracteres hexadecimales.');
        if (![source, destination].every(bucket => /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) || (!garage && source === destination)) {
            throw new Error('Ingresá nombres de bucket válidos; para R2 a R2 deben ser distintos.');
        }
        const connectionString = await prompts.ask(`URL PostgreSQL de ${environment} para seleccionar qué copiar (vacío para cancelar)`, true);
        if (!connectionString) {console.log('Cancelado. No se copió nada ni se modificó la base.'); return;}
        const url = new URL(connectionString);
        if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('La conexión debe ser una URL PostgreSQL.');
        database = new pg.Client({connectionString, connectionTimeoutMillis: 10000, statement_timeout: 30000});
        await database.connect();
        const identity = await database.query<{name: string; user: string}>('SELECT current_database() AS name, current_user AS "user"');
        const {name, user} = identity.rows[0];
        console.log(`Base elegida: ${JSON.stringify(name)}; usuario: ${JSON.stringify(user)}; servidor: ${url.hostname}:${url.port || '5432'}.`);
        console.log(`Una conexión a localhost también puede apuntar a producción mediante un túnel. Verificá que esta sea tu base de ${environment}.`);
        const references = await readReferences(database, source);
        console.log(`Referencias en ${environment} al bucket ${source}: ${references.filter(row => row.kind === 'file').length} archivos y ${references.filter(row => row.kind === 'snapshot').length} snapshots.`);
        console.log('Se incluyen archivos originales, vistas previas y snapshots históricos que figuren en esa base.');
        if (!references.length) {console.log('No hay referencias al bucket de origen. No hay nada que copiar.'); return;}
        const keys = new Set(references.map(row => row.key));
        const accessKeyId = await prompts.ask(garage ? 'Access Key ID de R2 (lectura del origen)' : 'Access Key ID del token con acceso a ambos buckets', true);
        const secretAccessKey = await prompts.ask('Secret Access Key', true);
        if (!accessKeyId || !secretAccessKey) throw new Error('Las credenciales son obligatorias.');
        storage = new S3Client({region: 'auto', endpoint: `https://${account}.r2.cloudflarestorage.com`,
            credentials: {accessKeyId, secretAccessKey}, maxAttempts: 3,
            requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED'});
        if (garage) {
            const endpoint = await prompts.ask('Endpoint S3 de Garage (vacío: http://127.0.0.1:3900)') || 'http://127.0.0.1:3900';
            const parsed = new URL(endpoint);
            if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
                throw new Error('Ingresá una URL HTTP/HTTPS sin credenciales ni parámetros.');
            }
            const region = await prompts.ask('Región de Garage (vacío: garage)') || 'garage';
            const targetKey = await prompts.ask(`Access Key ID de Garage para ${environment}`, true);
            const targetSecret = await prompts.ask('Secret Access Key de Garage', true);
            if (!targetKey || !targetSecret) throw new Error('Las credenciales de Garage son obligatorias.');
            targetStorage = new S3Client({endpoint, region, forcePathStyle: true, credentials: {accessKeyId: targetKey, secretAccessKey: targetSecret},
                maxAttempts: 3, requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED'});
        } else targetStorage = storage;
        console.log(`Consultando ${keys.size} objetos referenciados por ${environment}…`);
        const inventory = await referencedInventory(storage, source, keys, prompts.signal);
        const existing = await referencedInventory(targetStorage, destination, keys, prompts.signal, true);
        verifyReferences(references, inventory);
        let same = 0, replace = 0, bytes = 0;
        for (const [key, object] of inventory) {
            bytes += object.size;
            if (object.size > 5 * 1024 ** 3) throw new Error(`El objeto ${JSON.stringify(key)} supera los 5 GiB admitidos por esta copia simple. No se copió nada.`);
            if (!garage && sameObject(object, existing.get(key))) same++;
            else if (existing.has(key)) replace++;
        }
        console.log(`Origen: ${source}; destino: ${destination}.`);
        console.log(`${inventory.size} objetos (${(bytes / 1024 ** 2).toFixed(1)} MiB): ${inventory.size - same - replace} nuevos, ${same} iguales, ${replace} ${garage ? 'existentes por verificar' : 'a reemplazar'}.`);
        if (garage) console.log('Los objetos existentes se comparan por SHA-256 durante la copia y se omiten si coinciden. Se usa espacio temporal en disco para un objeto a la vez.');
        console.log('No se eliminan objetos del origen ni objetos adicionales del destino.');
        if (args.includes('--dry-run')) {console.log('Dry-run terminado. No se modificó el almacenamiento ni la base.'); return;}
        if (await prompts.ask(`Para copiar y reemplazar los objetos indicados, escribí COPIAR ${environment} ${destination}`) !== `COPIAR ${environment} ${destination}`) {
            console.log('Cancelado. No se copió nada.'); return;
        }
        const verified = garage
            ? await copyR2ToGarage(storage, targetStorage, source, destination, inventory, existing, prompts.signal)
            : await copyR2Bucket(storage, source, destination, inventory, existing, prompts.signal);
        if (source === destination) {
            verifyReferences(await readReferences(database, source), verified);
            console.log('Copia verificada. Los nombres de bucket coinciden: no hace falta modificar la base. Configurá el backend con el endpoint y las credenciales de Garage de este ambiente.');
            return;
        }
        console.log(`Copia verificada. Ahora podés actualizar file.bucket y dataset_snapshot.bucket en tu base de ${environment}.`);
        if (await prompts.ask(`Para confirmar que es ${environment} y actualizarla, escribí ACTUALIZAR ${environment} ${name}`) !== `ACTUALIZAR ${environment} ${name}`) {
            console.log('No se modificó la base. La copia se conserva.'); return;
        }
        // Recheck after the interactive pause, before switching any database references.
        const current = await referencedInventory(targetStorage, destination, verified.keys(), prompts.signal);
        for (const [key, object] of verified) if (!sameObject(object, current.get(key))) {
            throw new Error(`El destino cambió después de la copia: ${JSON.stringify(key)}. La base no fue modificada.`);
        }
        const currentSource = await referencedInventory(storage, source, inventory.keys(), prompts.signal);
        if ([...inventory].some(([key, object]) => !sameObject(object, currentSource.get(key)))) {
            throw new Error('El origen cambió después de la copia. La base no fue modificada; repetí con las escrituras detenidas.');
        }
        await database.query('BEGIN');
        try {
            await database.query("SET LOCAL lock_timeout = '5s'");
            await database.query('LOCK TABLE public.file, public.dataset_snapshot IN SHARE ROW EXCLUSIVE MODE');
            verifyReferences(await readReferences(database, source), verified);
            prompts.signal.throwIfAborted();
            const files = await database.query('UPDATE public.file SET bucket = $1 WHERE bucket = $2', [destination, source]);
            const snapshots = await database.query('UPDATE public.dataset_snapshot SET bucket = $1 WHERE bucket = $2', [destination, source]);
            prompts.signal.throwIfAborted();
            await database.query('COMMIT');
            console.log(`Base actualizada: ${files.rowCount} archivos y ${snapshots.rowCount} snapshots.`);
        } catch (error) {await database.query('ROLLBACK'); throw error;}
        console.log(`Configurá ${garage ? 'STORAGE_BUCKET' : 'CLOUDFLARE_BUCKET'}=${destination} y ${garage ? 'STORAGE_ENDPOINT, STORAGE_REGION, STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY y STORAGE_FORCE_PATH_STYLE=true' : 'las credenciales de este ambiente'} en el backend. El script no modifica archivos .env.`);
    } finally {await database?.end(); storage?.destroy(); if (targetStorage !== storage) targetStorage?.destroy(); prompts.close();}
}

async function readReferences(database: pg.Client, source: string) {
    const result = await database.query<{kind: 'file' | 'snapshot'; key: string; size: string}>(`
        SELECT 'file' AS kind, key, size::text AS size FROM public.file WHERE bucket = $1
        UNION ALL SELECT 'snapshot' AS kind, key, size_bytes::text AS size FROM public.dataset_snapshot WHERE bucket = $1`, [source]);
    return result.rows;
}

function verifyReferences(rows: {key: string; size: string}[], verified: BucketInventory) {
    for (const row of rows) {
        if (verified.get(row.key)?.size !== Number(row.size)) throw new Error(`Falta una copia verificada del archivo ${JSON.stringify(row.key)} con el tamaño que indica la base. No se actualizaron referencias.`);
    }
}

main().catch(error => {
    // Driver errors may contain URLs, credentials or signed requests. Report codes only.
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined;
    if (error instanceof Error && error.constructor === Error && !code) console.error(error.message.replace(/postgres(?:ql)?:\/\/\S+/g, '[conexión]'));
    else console.error(`La operación se interrumpió (${code ?? (error instanceof Error ? error.name : 'error desconocido')}). Revisá los permisos, la conexión y los datos ingresados. Las copias completadas se conservan.`);
    process.exitCode = 1;
});
