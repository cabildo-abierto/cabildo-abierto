import {randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions} from "node:crypto";
const KEY_LENGTH = 64;
const COST = 32768;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const MAX_MEMORY = 64 * 1024 * 1024;

function scrypt(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
            if (error) reject(error);
            else resolve(derivedKey);
        });
    });
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const hash = await scrypt(password, salt, KEY_LENGTH, {
        N: COST,
        r: BLOCK_SIZE,
        p: PARALLELIZATION,
        maxmem: MAX_MEMORY,
    });

    return ["scrypt", COST, BLOCK_SIZE, PARALLELIZATION, salt.toString("base64url"), hash.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
    const [algorithm, costValue, blockSizeValue, parallelizationValue, saltValue, hashValue] = encoded.split("$");
    const cost = Number(costValue);
    const blockSize = Number(blockSizeValue);
    const parallelization = Number(parallelizationValue);

    if (algorithm !== "scrypt" || !cost || !blockSize || !parallelization || !saltValue || !hashValue) {
        return false;
    }

    try {
        const expected = Buffer.from(hashValue, "base64url");
        const actual = await scrypt(password, Buffer.from(saltValue, "base64url"), expected.length, {
            N: cost,
            r: blockSize,
            p: parallelization,
            maxmem: MAX_MEMORY,
        });

        return expected.length === actual.length && timingSafeEqual(expected, actual);
    } catch {
        return false;
    }
}
