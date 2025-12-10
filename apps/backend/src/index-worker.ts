import {MirrorMachine} from "#/services/sync/mirror-machine.js";
import {Role, setupAppContext} from "#/setup.js";
import * as dotenv from 'dotenv';
dotenv.config();


export const run = async (roles: Role[]) => {
    const {ctx} = await setupAppContext(roles)

    if(roles.includes("mirror")){
        const ingester = new MirrorMachine(ctx)
        await ingester.run()
    } else {
        if(process.send) {
            process.send("ready")
            ctx.logger.pino.info("worker is ready")
        }
    }
}
