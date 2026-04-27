import {readFileSync} from "node:fs"
import {join, dirname} from "node:path"
import {fileURLToPath} from "node:url"
import {setupAppContext} from "#/setup.js"
import {syncUser} from "#/services/sync/sync-user.js"
import {runtime} from "#/instrumentation.js";

const __dirname = dirname(fileURLToPath(import.meta.url))

const collections = [
    "ar.cabildoabierto.wiki.topicVersion",
    "ar.cabildoabierto.actor.profile",
    "app.bsky.actor.profile",
    "ar.cabildoabierto.data.dataset",
    "ar.cabildoabierto.wiki.voteAccept",
    "ar.cabildoabierto.wiki.voteReject"
]

async function run() {
    const {ctx} = await setupAppContext([])

    const lines = readFileSync(join(__dirname, "ca-users.txt"), "utf-8")
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0)

    for (const did of lines) {
        ctx.logger.pino.info({did}, "syncing user")
        await runtime.runPromise(syncUser(ctx, did, collections, false))
    }
    ctx.logger.pino.info("done")
}

run()
