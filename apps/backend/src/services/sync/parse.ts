import {BlobRef} from "@atproto/lexicon";
import {CID} from 'multiformats/cid'
import {AppContext} from "#/setup.js";

export function parseRecord(ctx: AppContext, obj: any): any {

    if (Array.isArray(obj)) {
        return Array.from(obj.map(o => parseRecord(ctx, o)))
    }

    if (obj && typeof obj === 'object') {
        if (obj.$type === 'blob') {
            if (obj.ref?.$link) {
                const cid = CID.parse(obj.ref.$link);
                return new BlobRef(cid, obj.mimeType, obj.size)
            } else {
                return obj
            }
        }

        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = parseRecord(ctx, obj[key]);
        }

        return newObj
    }

    return obj
}

