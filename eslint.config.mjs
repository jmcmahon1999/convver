import { defineConfig } from "eslint/config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginJest from "eslint-plugin-jest";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node } },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.spec.js", "**/*.test.js", "test/helpers/*.js"],
    ...eslintPluginJest.configs["flat/recommended"],
    env: {
      "jest/globals": true,
    },
  },
  eslintPluginPrettierRecommended,
]);
