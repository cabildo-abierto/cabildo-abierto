import {describe, expect, it} from "vitest";
import {hashSessionToken} from "./session.js";

describe("session tokens", () => {
    it("hashes tokens deterministically without retaining the raw token", () => {
        const token = "private-session-token";
        const hash = hashSessionToken(token);

        expect(hash).toHaveLength(64);
        expect(hash).toBe(hashSessionToken(token));
        expect(hash).not.toContain(token);
    });
});
