import {AppContext} from "#/setup.js";
import {getCollectionFromUri} from "@cabildo-abierto/utils";


export class DeleteProcessor {
    ctx: AppContext

    constructor(ctx: AppContext) {
        this.ctx = ctx
    }

    async process(uris: string[]) {
        await this.deleteRecordsFromDB(uris)
        await this.ctx.redisCache.onDeleteRecords(uris)
    }

    async deleteRecordsFromDB(uris: string[]) {
        await this.ctx.kysely
            .deleteFrom("Record")
            .where("Record.uri", "in", uris)
            .execute()
    }

    async processInBatches(uris: string[]) {
        if(uris.length == 0) return
        const c = getCollectionFromUri(uris[0])
        const batchSize = 5000
        for (let j = 0; j < uris.length; j += batchSize) {
            const batchUris = uris.slice(j, j + batchSize)
            await this.process(batchUris)
            this.ctx.logger.pino.info({collection: c, index: j, total: uris.length}, `delete batch done`)
        }
    }
}


