import stringify from "json-stable-stringify";
import objectHash from "object-hash";

export function getObjectKey(obj: any): string {
    const stableStr = stringify(obj);
    return stableStr ? objectHash(stableStr) : "null"
}


