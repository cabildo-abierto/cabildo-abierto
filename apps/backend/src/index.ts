/*index.ts*/
import * as dotenv from 'dotenv'
dotenv.config()

import {Server} from './server.js'
import {Role} from "#/setup.js";

export const run = async (roles: Role[]) => {
    const server = await Server.create(roles)

    const onCloseSignal = async () => {
        setTimeout(() => process.exit(1), 10000).unref()
        await server.close()
        process.exit()
    }

    process.on('SIGINT', onCloseSignal)
    process.on('SIGTERM', onCloseSignal)
}

run(["web"])
