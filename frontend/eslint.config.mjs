import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "next-env.d.ts",
    "App.tsx",
    "index.tsx",
    "components/FlickeringGrid.tsx",
    "components/ui/**",
    "hooks/**",
  ]),
])
