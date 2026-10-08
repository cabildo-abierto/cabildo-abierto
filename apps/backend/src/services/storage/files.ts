import {randomUUID, createHash} from "node:crypto";
import {createReadStream} from "node:fs";
import {stat} from "node:fs/promises";
import type {AppContext} from "#/setup.js";
import {storageBucket, type ObjectStorage} from "./storage.js";

export async function storeFile(ctx: AppContext, storage: ObjectStorage, path: string, name: string, mime: string, authorId: string) {
    const id = randomUUID();
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    const file = {id, author_id: authorId, name, mime, size: (await stat(path)).size,
        bucket: storageBucket(), key: `files/${id}`, sha256: hash.digest("hex")};
    await storage.put(file, path, mime, file.size);
    try {
        await ctx.kysely.insertInto("file").values(file).execute();
    } catch (error) {
        await storage.remove(file).catch(cleanupError => ctx.logger.pino.error({cleanupError, fileId: id}, "file cleanup failed"));
        throw error;
    }
    return file;
}

export async function removeUnattachedFile(ctx: AppContext, storage: ObjectStorage, fileId: string) {
    const file = await ctx.kysely.selectFrom("file").selectAll().where("id", "=", fileId).executeTakeFirst();
    if (!file) return;
    const snapshots=await ctx.kysely.selectFrom('dataset_snapshot').innerJoin('dataset_source','dataset_source.id','dataset_snapshot.source_id')
        .select(['dataset_snapshot.bucket','dataset_snapshot.key']).where('dataset_source.file_id','=',fileId).execute();
    await ctx.kysely.deleteFrom("file").where("id", "=", fileId).execute();
    for(const snapshot of snapshots)await storage.remove(snapshot).catch(error=>ctx.logger.pino.error({fileId,error},'dataset cleanup failed'));
    await storage.remove(file);
}
