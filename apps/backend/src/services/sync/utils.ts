import {BlobRef} from "@atproto/lexicon";

export function getCidFromBlobRef(o: BlobRef) {
    return o.ref.toString()
}