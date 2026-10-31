import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = fileURLToPath(new URL(
  existsSync(new URL("../../pnpm-workspace.yaml", import.meta.url)) ? "../../" : ".",
  import.meta.url,
));

export default {
  output: "export",
  outputFileTracingRoot: root,
  turbopack: { root },
  images: { unoptimized: true },
};
