import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        "scripts/check-dataset-jq": "src/scripts/check-dataset-jq.ts",
        "dataset-prepare-worker": "src/services/datasets/prepare-worker.ts",
        "dataset-search-worker": "src/services/datasets/search-worker.ts",
        "dataset-page-worker": "src/services/datasets/page-worker.ts",
        "scripts/datasets-prepare": "src/scripts/datasets-prepare.ts",
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
