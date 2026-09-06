import {describe, expect, it} from "vitest";
import {canonicalizeTopicId} from "./canonicalize-topic-id.js";

describe("canonicalizeTopicId", () => {
    it("normalizes case, accents, spaces and punctuation", () => {
        expect(canonicalizeTopicId("  ¿Educación Pública en 2026?  ")).toBe("educacion-publica-en-2026");
    });

    it("collapses separators and trims hyphens", () => {
        expect(canonicalizeTopicId("---Un tema___nuevo---")).toBe("un-tema-nuevo");
    });
});
