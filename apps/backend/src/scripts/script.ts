import {setupAppContext} from "#/setup.js";


async function run() {
    const {ctx} = await setupAppContext([])
    const t1 = Date.now()
    ctx.logger.logTimes("done", [t1, Date.now()])
}

run()