import {readFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {setupAppContext} from "#/setup.js";
import {Effect} from "effect";

type UserToSync = {
    input: string
    did: string
}

const syncJobPriority = 21
const batchSize = 100

function parseUsersFile(contents: string): string[] {
    const users = contents
        .split(/\r?\n/)
        .map(line => line.split("#")[0].trim())
        .filter(Boolean)

    return [...new Set(users)]
}

async function resolveUsers(inputs: string[], ctx: Awaited<ReturnType<typeof setupAppContext>>["ctx"]) {
    const users: UserToSync[] = []
    const unresolved: string[] = []

    for(const input of inputs) {
        if(input.startsWith("did:")) {
            users.push({input, did: input})
            continue
        }

        const did = await Effect.runPromise(ctx.resolver.resolveHandleToDid(input))
        if(did) {
            users.push({input, did})
        } else {
            unresolved.push(input)
        }
    }

    return {users, unresolved}
}

async function grantAccess(users: UserToSync[], ctx: Awaited<ReturnType<typeof setupAppContext>>["ctx"]) {
    for(let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)

        await ctx.kysely
            .insertInto("User")
            .values(batch.map(({input, did}) => ({
                did,
                handle: input.startsWith("did:") ? undefined : input,
                createdAt: new Date(),
                hasAccess: true,
                inCA: true
            })))
            .onConflict(oc => oc.column("did").doUpdateSet({
                hasAccess: true,
                inCA: true
            }))
            .execute()
    }
}

async function addSyncJobs(users: UserToSync[], ctx: Awaited<ReturnType<typeof setupAppContext>>["ctx"]) {
    for(let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)

        await Effect.runPromise(Effect.all(
            batch.map(({did}) => ctx.redisCache.mirrorStatus.set(did, "InProcess", true)),
            {concurrency: 10}
        ))

        await Effect.runPromise(ctx.worker.addJobs(batch.map(({did}) => ({
            label: "sync-user",
            data: {handleOrDid: did},
            priority: syncJobPriority
        }))))
    }
}

async function run() {
    const {ctx} = await setupAppContext([])
    const startedAt = Date.now()
    const scriptDir = dirname(fileURLToPath(import.meta.url))
    const usersPath = resolve(scriptDir, "ca-users.txt")

    try {
        const inputs = parseUsersFile(await readFile(usersPath, "utf8"))
        const {users, unresolved} = await resolveUsers(inputs, ctx)

        await grantAccess(users, ctx)
        await addSyncJobs(users, ctx)

        ctx.logger.pino.info({
            file: usersPath,
            usersInFile: inputs.length,
            usersResolved: users.length,
            unresolved,
            syncJobsCreated: users.length,
            elapsedMs: Date.now() - startedAt
        }, "ca users granted access and queued for sync")
    } finally {
        await ctx.kysely.destroy()
        await ctx.ioredis.quit()
    }
}

run().catch(error => {
    console.error(error)
    process.exit(1)
})
