import {CopyObjectCommand, HeadObjectCommand, type S3Client} from '@aws-sdk/client-s3';

export type BucketInventory = Map<string, {size: number; etag: string}>;

export async function referencedInventory(client: S3Client, bucket: string, keys: Iterable<string>, signal: AbortSignal, allowMissing = false): Promise<BucketInventory> {
    const inventory: BucketInventory = new Map();
    for (const key of new Set(keys)) {
        try {
            const object = await client.send(new HeadObjectCommand({Bucket: bucket, Key: key}), {abortSignal: signal});
            if (object.ContentLength === undefined || !object.ETag) throw new Error(`R2 devolvió un objeto sin tamaño o ETag: ${JSON.stringify(key)}.`);
            inventory.set(key, {size: object.ContentLength, etag: object.ETag});
        } catch (error) {
            const missing = error && typeof error === 'object' && '$metadata' in error
                && (error.$metadata as {httpStatusCode?: number}).httpStatusCode === 404;
            if (missing && allowMissing) continue;
            if (missing) throw new Error(`Falta en ${bucket} el objeto referenciado por dev: ${JSON.stringify(key)}.`);
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
