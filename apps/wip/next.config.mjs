import { fileURLToPath } from "node:url";

export default {
  output: "export",
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  images: { unoptimized: true },
};
