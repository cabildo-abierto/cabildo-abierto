import {describe, expect, it} from "vitest";
import {hashPassword, verifyPassword} from "./password.js";

describe("password hashing", () => {
    it("verifies the original password but not a different one", async () => {
        const hash = await hashPassword("una contraseña segura");

        expect(await verifyPassword("una contraseña segura", hash)).toBe(true);
        expect(await verifyPassword("otra contraseña", hash)).toBe(false);
    });

    it("uses a unique salt for each hash", async () => {
        const first = await hashPassword("the same password");
        const second = await hashPassword("the same password");

        expect(first).not.toBe(second);
    });

    it("rejects malformed hashes", async () => {
        expect(await verifyPassword("password", "not-a-password-hash")).toBe(false);
    });
});
