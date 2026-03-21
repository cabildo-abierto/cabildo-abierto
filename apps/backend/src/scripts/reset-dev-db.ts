import {setupAppContext} from "#/setup.js";
import {resetTestDB} from "#/tests/test-utils.js";


async function run() {
    const {ctx} = await setupAppContext([])
    const t1 = Date.now()

    await resetTestDB()

    ctx.logger.logTimes("done", [t1, Date.now()])
}

run()