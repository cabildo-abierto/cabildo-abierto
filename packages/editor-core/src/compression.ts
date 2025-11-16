import { compressSync, decompressSync, strFromU8, strToU8 } from "fflate";


function base64Encode(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64Decode(b64: string): Uint8Array {
    const binary = atob(b64);
    const u8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        u8[i] = binary.charCodeAt(i);
    }
    return u8;
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
