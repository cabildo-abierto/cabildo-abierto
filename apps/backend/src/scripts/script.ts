import {setupAppContext} from "#/setup.js";
import {createInviteCodes} from "#/services/user/access.js";
import {Effect} from "effect";


async function run() {
    const {ctx} = await setupAppContext([])

    const codes = await Effect.runPromise(createInviteCodes(ctx, 1, 1))

    ctx.logger.pino.info({codes}, "got codes")

    const t1 = Date.now()
    ctx.logger.logTimes("done", [t1, Date.now()])
}

run()