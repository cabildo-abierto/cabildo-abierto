import {compressSync, decompressSync, strFromU8, strToU8} from 'fflate';

function base64Encode(u8: Uint8Array): string {
    return Buffer.from(u8).toString('base64');
}

function base64Decode(b64: string): Uint8Array {
    return Uint8Array.from(Buffer.from(b64, 'base64'));
}

export function compress(s: string): string {
    const u8 = strToU8(s);
    const compressed = compressSync(u8, { level: 9 });
    return base64Encode(compressed);
}

export function decompress(s: string): string {
    const compressedU8 = base64Decode(s);
    const decompressedU8 = decompressSync(compressedU8);
    return strFromU8(decompressedU8);
}