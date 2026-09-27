import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        "lcca-worker": "src/services/visualizations/query-worker.ts",
        "index": "src/index.ts",
        "scripts/apply-migrations": "src/scripts/apply-migrations.ts",
        "scripts/search-reindex": "src/scripts/search-reindex.ts"
    },
    format: ["esm"],
    splitting: false,
    sourcemap: true,
    clean: true,
    platform: "node",
    target: "node20",
    bundle: true,

    skipNodeModulesBundle: true,

    external: [
        /^@cabildo-abierto\/api$/,
        /^@atproto\//,
        "safer-buffer",
        "iconv-lite",
        "whatwg-encoding",
        "undici",
        "express",
        "cors",
        "morgan",
        "dotenv",
        "pg",
        "kysely",
        "pino",
        "jsonwebtoken",
        "jsdom"
    ]
});
