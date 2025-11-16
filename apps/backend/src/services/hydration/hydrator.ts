import {Dataplane} from "#/services/hydration/dataplane.js";
import {AppContext} from "#/setup.js";


export class Hydrator<P, Q> {
    ctx: AppContext
    dataplane: Dataplane
    constructor(ctx: AppContext, data: Dataplane) {
        this.dataplane = data
        this.ctx = ctx
    }

    hydrate(params: P): Q | null {
        throw Error("Sin implementar")
    }
}

