import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Code vendor ReUI — cài nguyên bản qua shadcn CLI, quy ước KHÔNG sửa (xem DESIGN_RULES.md).
    "src/components/reui/**",
    "src/components/blocks/**",
    // Bản sao nguyên văn maplibre-gl/dist (đã minify), xem lib/map-worker.ts.
    "public/maplibre-gl-worker.mjs",
  ]),
]);

export default eslintConfig;
