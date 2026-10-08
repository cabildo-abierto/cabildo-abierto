import {createReadStream} from "node:fs";
import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {env} from "#/lib/env.js";

export type StorageObject = {bucket: string; key: string};
export interface ObjectStorage {
    put(object: StorageObject, path: string, mime: string, size: number, signal?: AbortSignal): Promise<void>;
    read(object: StorageObject): Promise<Uint8Array>;
    remove(object: StorageObject): Promise<void>;
    signedUrl(object: StorageObject, disposition: string, mime: string, audience?: "internal" | "public"): Promise<string>;
}

export function storageBucket() {
    return env.STORAGE_ENDPOINT ? env.STORAGE_BUCKET : env.CLOUDFLARE_BUCKET;
}

export class S3Storage implements ObjectStorage {
    private client: S3Client;
    private publicClient: S3Client;
    constructor() {
        const custom = Boolean(env.STORAGE_ENDPOINT);
        const endpoint = custom ? env.STORAGE_ENDPOINT : `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
        const region = custom ? env.STORAGE_REGION : "auto";
        const accessKeyId = custom ? env.STORAGE_ACCESS_KEY_ID : env.CLOUDFLARE_ACCESS_KEY_ID;
        const secretAccessKey = custom ? env.STORAGE_SECRET_ACCESS_KEY : env.CLOUDFLARE_SECRET_ACCESS_KEY;
        if ((!custom && !env.CLOUDFLARE_ACCOUNT_ID) || !region || !accessKeyId || !secretAccessKey || !storageBucket()) {
            throw new Error("El almacenamiento de archivos no está configurado.");
        }
        const options = {region, forcePathStyle: custom && env.STORAGE_FORCE_PATH_STYLE,
            credentials: {accessKeyId, secretAccessKey},
            requestChecksumCalculation: "WHEN_REQUIRED" as const, responseChecksumValidation: "WHEN_REQUIRED" as const};
        this.client = new S3Client({...options, endpoint});
        this.publicClient = env.STORAGE_PUBLIC_ENDPOINT && env.STORAGE_PUBLIC_ENDPOINT !== endpoint
            ? new S3Client({...options, endpoint: env.STORAGE_PUBLIC_ENDPOINT}) : this.client;
    }
    async put(object: StorageObject, path: string, mime: string, size: number, signal?: AbortSignal) {
        await this.client.send(new PutObjectCommand({Bucket: object.bucket, Key: object.key, Body: createReadStream(path), ContentType: mime, ContentLength: size}), {abortSignal: signal});
    }
    async read(object: StorageObject) {
        const result = await this.client.send(new GetObjectCommand({Bucket: object.bucket, Key: object.key}));
        if (!result.Body) throw new Error("El archivo no tiene contenido.");
        return result.Body.transformToByteArray();
    }
    async remove(object: StorageObject) {
        await this.client.send(new DeleteObjectCommand({Bucket: object.bucket, Key: object.key}));
    }
    signedUrl(object: StorageObject, disposition: string, mime: string, audience: "internal" | "public" = "internal") {
        return getSignedUrl(audience === "public" ? this.publicClient : this.client, new GetObjectCommand({Bucket: object.bucket, Key: object.key,
            ResponseContentDisposition: disposition, ResponseContentType: mime}), {expiresIn: 900});
    }
}
