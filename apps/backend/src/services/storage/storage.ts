import {env} from "#/lib/env.js";
import {v4 as uuidv4} from "uuid";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {GetObjectCommand, PutObjectCommand, S3Client,} from "@aws-sdk/client-s3";
import { Logger } from "#/utils/logger.js";

export type FilePayload = { base64: string, fileName: string }

function extractMimeType(base64: string): string | null {
    const match = base64.match(/^data:(.*?);base64,/);
    return match ? match[1] : null;
}

function sanitizeFileName(fileName: string): string {
    return fileName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.\-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();
}

export class S3Storage {
    client: S3Client
    logger: Logger

    constructor(logger: Logger) {
        this.logger = logger;
        const accountId = env.CLOUDFLARE_ACCOUNT_ID
        const accessKeyId = env.CLOUDFLARE_ACCESS_KEY_ID
        const secretAccessKey = env.CLOUDFLARE_SECRET_ACCESS_KEY

        this.client = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        })
    }

    async getSignedUrlsFromPaths(paths: string[], bucket: string) {
        const signedUrlPromises = paths.map(path =>
            getSignedUrl(
                this.client,
                new GetObjectCommand({Bucket: bucket, Key: path}),
                {expiresIn: 3600 * 24} // URLs will be valid for 24 hours
            )
        );

        return {data: await Promise.all(signedUrlPromises)}
    }

    async upload(file: FilePayload, bucket: string) {
        const id = uuidv4()
        const fileBuffer = Buffer.from(file.base64.split(',')[1], 'base64');

        const safeFileName = sanitizeFileName(file.fileName);
        const filePath = `${id}/${safeFileName}`;

        const contentType = extractMimeType(file.base64) || 'application/octet-stream'

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: filePath,
            Body: fileBuffer,
            ContentType: contentType,
        });

        try {
            await this.client.send(command)
            return { path: filePath }
        } catch {
            return {error: "Ocurrió un error al guardar el contenido."}
        }
    }

    async download(path: string, bucket: string) {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: path,
        })

        try {
            const response = await this.client.send(command);

            if (!response.Body || !response.ContentType) {
                return { error: "El archivo no tiene contenido o no se pudo leer." };
            }

            const bodyAsByteArray = await response.Body.transformToByteArray();
            const fileBuffer = Buffer.from(bodyAsByteArray);

            return {
                data: {
                    file: fileBuffer,
                    contentType: response.ContentType,
                }
            };
        } catch (error) {
            this.logger.pino.error({error}, "S3 Download Error");
            return { error: "Ocurrió un error al descargar el contenido." };
        }
    }
}