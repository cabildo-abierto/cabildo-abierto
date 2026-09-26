import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {mkdtemp, mkdir, open, rm, stat, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {extname, join} from "node:path";
import {pathToFileURL} from "node:url";
import type {AppContext} from "#/setup.js";
import type {ObjectStorage} from "#/services/storage/storage.js";
import {storeFile, removeUnattachedFile} from "#/services/storage/files.js";
import {env} from "#/lib/env.js";
import {TopicActionError} from "#/services/topic-title-edits.js";

const execute = promisify(execFile);
let converting = false;

export async function convertOfficeFile(ctx: AppContext, storage: ObjectStorage, fileId: string) {
    if (converting) throw new TopicActionError(409, "Hay otra conversión en curso. Reintentá en unos momentos.");
    converting = true;
    let directory: string | undefined;
    let previewId: string | undefined;
    try {
        const file = await ctx.kysely.selectFrom("file")
            .select(["file.name", "file.bucket", "file.key", "file.author_id", "file.format", "file.preview_file_id"])
            .where("file.id", "=", fileId).executeTakeFirstOrThrow();
        if (file.format !== "office" || file.preview_file_id) return;
        directory = await mkdtemp(join(tmpdir(), 'ca-convert-'));
        const profile = join(directory, 'profile');
        await mkdir(join(profile, 'user'), {recursive: true});
        await writeFile(join(profile, 'user', 'registrymodifications.xcu'), `<?xml version="1.0"?><oor:items xmlns:oor="http://openoffice.org/2001/registry"><item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item><item oor:path="/org.openoffice.Office.Common/Load"><prop oor:name="UpdateDocMode" oor:op="fuse"><value>0</value></prop></item></oor:items>`);
        const input = join(directory, `input${extname(file.name).toLowerCase()}`);
        await writeFile(input, await storage.read(file));
        await ctx.kysely.updateTable('file').set({preview_status: 'pending', preview_error: null}).where('id', '=', fileId).execute();
        await execute(env.LIBREOFFICE_PATH, [`-env:UserInstallation=${pathToFileURL(profile).href}`, '--headless', '--nologo', '--nodefault', '--norestore', '--convert-to', 'pdf', '--outdir', directory, input],
            {env: {PATH: process.env.PATH, HOME: directory, LANG: 'C.UTF-8'}, timeout: 60_000, killSignal: 'SIGKILL', maxBuffer: 1024 * 1024});
        const output = join(directory, 'input.pdf');
        if ((await stat(output)).size > env.DOCUMENT_MAX_MB * 1024 * 1024) throw new Error('PDF output exceeds size limit');
        const handle = await open(output, 'r');
        try {
            const header = Buffer.alloc(5);
            await handle.read(header, 0, 5, 0);
            if (!header.equals(Buffer.from('%PDF-'))) throw new Error('Invalid PDF output');
        } finally { await handle.close(); }
        const preview = await storeFile(ctx, storage, output, `${file.name}.pdf`, 'application/pdf', file.author_id);
        previewId = preview.id;
        await ctx.kysely.updateTable('file').set({preview_file_id: preview.id, preview_status: 'ready', preview_error: null}).where('id', '=', fileId).execute();
    } catch (error) {
        if (previewId) await removeUnattachedFile(ctx, storage, previewId).catch(cleanupError => ctx.logger.pino.error({cleanupError}, 'preview cleanup failed'));
        ctx.logger.pino.error({error, fileId}, 'document conversion failed');
        await ctx.kysely.updateTable('file').set({preview_status: 'failed', preview_error: 'No pudimos generar la vista previa. Podés descargar el original o reintentar.'}).where('id', '=', fileId).execute();
    } finally {
        converting = false;
        if (directory) await rm(directory, {recursive: true, force: true}).catch(error => ctx.logger.pino.error({error}, 'conversion temporary cleanup failed'));
    }
}
