import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "src/index.ts",
        "src/worker.ts",
        "src/mirror.ts",
        "src/worker-mirror.ts"
    ],
    format: ["esm"],
    splitting: false,
    sourcemap: true,
    clean: true,
    platform: "node",
    target: "node20",
    bundle: true,

    skipNodeModulesBundle: true,

    noExternal: [
        "@cabildo-abierto/utils",
        "@cabildo-abierto/editor-core"
    ],

    external: [
        /^@cabildo-abierto\/api$/,
        /^@atproto\//,
        "safer-buffer",
        "iconv-lite",
        "whatwg-encoding",
        "undici"
    ]
});
