import {createHash} from 'node:crypto';
import {createReadStream, createWriteStream} from 'node:fs';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Transform, Writable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {CopyObjectCommand, GetObjectCommand, PutObjectCommand, HeadObjectCommand, type S3Client} from '@aws-sdk/client-s3';

export type BucketInventory = Map<string, {size: number; etag: string}>;

export async function referencedInventory(client: S3Client, bucket: string, keys: Iterable<string>, signal: AbortSignal, allowMissing = false): Promise<BucketInventory> {
    const inventory: BucketInventory = new Map();
    for (const key of new Set(keys)) {
        try {
            const object = await client.send(new HeadObjectCommand({Bucket: bucket, Key: key}), {abortSignal: signal});
            if (object.ContentLength === undefined || !object.ETag) throw new Error(`El almacenamiento devolvió un objeto sin tamaño o ETag: ${JSON.stringify(key)}.`);
            inventory.set(key, {size: object.ContentLength, etag: object.ETag});
        } catch (error) {
            const missing = error && typeof error === 'object' && '$metadata' in error
                && (error.$metadata as {httpStatusCode?: number}).httpStatusCode === 404;
            if (missing && allowMissing) continue;
            if (missing) throw new Error(`Falta en ${bucket} el objeto referenciado por la base: ${JSON.stringify(key)}.`);
            throw error;
        }
    }
    return inventory;
}

export function sameObject(left: {size: number; etag: string}, right?: {size: number; etag: string}) {
    return !!right && left.size === right.size && left.etag === right.etag;
}

export async function copyR2Bucket(client: S3Client, source: string, destination: string, inventory: BucketInventory, existing: BucketInventory, signal: AbortSignal) {
    const verified: BucketInventory = new Map();
    for (const [key, object] of inventory) {
        const unchanged = sameObject(object, existing.get(key));
        let etag = object.etag;
        if (!unchanged) {
            const result = await client.send(new CopyObjectCommand({Bucket: destination, Key: key,
                CopySource: `${encodeURIComponent(source)}/${key.split('/').map(encodeURIComponent).join('/')}`,
                CopySourceIfMatch: object.etag, MetadataDirective: 'COPY',
            }), {abortSignal: signal});
            if (!result.CopyObjectResult?.ETag) throw new Error(`R2 no confirmó la copia de ${JSON.stringify(key)}.`);
            etag = result.CopyObjectResult.ETag;
        }
        const head = await client.send(new HeadObjectCommand({Bucket: destination, Key: key}), {abortSignal: signal});
        if (head.ContentLength !== object.size || head.ETag !== etag) throw new Error(`Falló la verificación de ${JSON.stringify(key)}.`);
        verified.set(key, {size: object.size, etag});
        console.log(`[${verified.size}/${inventory.size}] ${unchanged ? 'EXISTENTE' : 'COPIADO'} ${JSON.stringify(key)}`);
    }
    const current = await referencedInventory(client, source, inventory.keys(), signal);
    if (current.size !== inventory.size || [...inventory].some(([key, object]) => !sameObject(object, current.get(key)))) {
        throw new Error('Un objeto referenciado del origen cambió durante la copia. Repetí el script con las escrituras detenidas; la base no fue modificada.');
    }
    return verified;
}

// Cross-provider ETags are not comparable. Verify the bytes with SHA-256 instead.
export async function copyR2ToGarage(sourceClient: S3Client, destinationClient: S3Client, source: string, destination: string,
    inventory: BucketInventory, existing: BucketInventory, signal: AbortSignal) {
    const directory = await mkdtemp(join(tmpdir(), 'cabildo-storage-copy-'));
    const verified: BucketInventory = new Map();
    try {
        for (const [key, object] of inventory) {
            signal.throwIfAborted();
            const path = join(directory, 'object');
            const original = await sourceClient.send(new GetObjectCommand({Bucket: source, Key: key, IfMatch: object.etag}), {abortSignal: signal});
            if (!original.Body || original.ContentLength !== object.size) throw new Error(`El origen cambió: ${JSON.stringify(key)}.`);
            const hash = createHash('sha256');
            let size = 0;
            const meter = new Transform({transform(chunk, _encoding, done) {hash.update(chunk); size += chunk.length; done(null, chunk);}});
            await pipeline(original.Body as NodeJS.ReadableStream, meter, createWriteStream(path), {signal});
            if (size !== object.size) throw new Error(`Descarga incompleta: ${JSON.stringify(key)}.`);
            const digest = hash.digest('hex');
            const target = existing.get(key);
            const unchanged = target?.size === object.size && await objectDigest(destinationClient, destination, key, target.etag, signal) === digest;
            if (!unchanged) {
                const body = createReadStream(path);
                try {
                    await destinationClient.send(new PutObjectCommand({Bucket: destination, Key: key, Body: body, ContentLength: size,
                        ContentType: original.ContentType, ContentDisposition: original.ContentDisposition, ContentEncoding: original.ContentEncoding,
                        ContentLanguage: original.ContentLanguage, CacheControl: original.CacheControl, Expires: original.Expires, Metadata: original.Metadata,
                    }), {abortSignal: signal});
                } finally {body.destroy();}
            }
            const head = await destinationClient.send(new HeadObjectCommand({Bucket: destination, Key: key}), {abortSignal: signal});
            if (!head.ETag || head.ContentLength !== size || (unchanged ? head.ETag !== target?.etag
                : await objectDigest(destinationClient, destination, key, head.ETag, signal) !== digest)) {
                throw new Error(`Falló la verificación de contenido: ${JSON.stringify(key)}. La base no fue modificada.`);
            }
            verified.set(key, {size, etag: head.ETag});
            await rm(path);
            console.log(`[${verified.size}/${inventory.size}] ${unchanged ? 'EXISTENTE' : 'COPIADO'} ${JSON.stringify(key)}`);
        }
        const current = await referencedInventory(sourceClient, source, inventory.keys(), signal);
        if ([...inventory].some(([key, object]) => !sameObject(object, current.get(key)))) {
            throw new Error('El origen cambió durante la copia. Repetí con las escrituras detenidas; la base no fue modificada.');
        }
        return verified;
    } finally {await rm(directory, {recursive: true, force: true});}
}

async function objectDigest(client: S3Client, bucket: string, key: string, etag: string, signal: AbortSignal) {
    const result = await client.send(new GetObjectCommand({Bucket: bucket, Key: key, IfMatch: etag}), {abortSignal: signal});
    if (!result.Body) throw new Error(`No se pudo verificar ${JSON.stringify(key)}.`);
    const hash = createHash('sha256');
    await pipeline(result.Body as NodeJS.ReadableStream, new Writable({write(chunk, _encoding, done) {hash.update(chunk); done();}}), {signal});
    return hash.digest('hex');
}
