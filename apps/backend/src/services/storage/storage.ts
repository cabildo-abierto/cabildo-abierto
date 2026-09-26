import {createReadStream} from "node:fs";
import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {env} from "#/lib/env.js";

export type StorageObject = {bucket: string; key: string};
export interface ObjectStorage {
    put(object: StorageObject, path: string, mime: string, size: number): Promise<void>;
    read(object: StorageObject): Promise<Uint8Array>;
    remove(object: StorageObject): Promise<void>;
    signedUrl(object: StorageObject, disposition: string, mime: string): Promise<string>;
}

export class R2Storage implements ObjectStorage {
    private client: S3Client;
    constructor() {
        if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_ACCESS_KEY_ID || !env.CLOUDFLARE_SECRET_ACCESS_KEY || !env.CLOUDFLARE_BUCKET) {
            throw new Error("El almacenamiento de archivos no está configurado.");
        }
        this.client = new S3Client({region: "auto", endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID, secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY},
            requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED"});
    }
    async put(object: StorageObject, path: string, mime: string, size: number) {
        await this.client.send(new PutObjectCommand({Bucket: object.bucket, Key: object.key, Body: createReadStream(path), ContentType: mime, ContentLength: size}));
    }
    async read(object: StorageObject) {
        const result = await this.client.send(new GetObjectCommand({Bucket: object.bucket, Key: object.key}));
        if (!result.Body) throw new Error("El archivo no tiene contenido.");
        return result.Body.transformToByteArray();
    }
    async remove(object: StorageObject) {
        await this.client.send(new DeleteObjectCommand({Bucket: object.bucket, Key: object.key}));
    }
    signedUrl(object: StorageObject, disposition: string, mime: string) {
        return getSignedUrl(this.client, new GetObjectCommand({Bucket: object.bucket, Key: object.key,
            ResponseContentDisposition: disposition, ResponseContentType: mime}), {expiresIn: 900});
    }
}
