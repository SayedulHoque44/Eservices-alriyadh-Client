import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Allow usage of 'any' type without error, only warn
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // disable error/warning for 'any'
      "no-explicit-any": "off", // if using base typescript eslint

      // Disable unused variable warnings
      "@typescript-eslint/no-unused-vars": "off", // disable unused variable warnings
      "no-unused-vars": "off", // disable unused variable warnings for base eslint
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
