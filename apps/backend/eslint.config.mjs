import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

const tsPlugin = tseslint.plugin;
const tsParser = tseslint.parser;

export default defineConfig([
  {
    ignores: [
      "node_modules/",
      ".next/",
      "src/lex-api/",
      "src/lex-server/",
      "docker-entrypoint.js",
      "dist/",
    ],
  },
  {
    files: ["**/*.{ts,tsx,cts,mts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
        project: true,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // your custom TS rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "vars": "all", "argsIgnorePattern": "^_", "args": "none", "ignoreRestSiblings": false }],
    },
  },
  {
    files: ["**/*.{js,cjs,mjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": ["error", { vars: "all", args: "after-used" }],
    },
  },
]);
