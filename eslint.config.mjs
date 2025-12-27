import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
// eslint.config.js
import next from "eslint-config-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import globals from "globals";

export default [...nextCoreWebVitals, ...nextTypescript, {
  ignores: [
    "node_modules/**",
    ".next/**",
    "dist/**",
    "build/**",
    "coverage/**",
  ],
}, {
  files: ["**/*.{ts,tsx,js,jsx}"],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: "./tsconfig.json",
      ecmaFeatures: { jsx: true },
    },
    globals: {
      ...globals.browser,
      React: true,
      JSX: true,
    },
  },
  plugins: {
    "@typescript-eslint": tseslint,
    react,
    "react-hooks": reactHooks,
  },
  settings: {
    react: { version: "detect" },
    next: { rootDir: ["."] },
  },
  extends: [
    ...next,
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    /* --- TypeScript --- */
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",

    /* --- React / JSX --- */
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react/prop-types": "off",

    /* --- Next.js --- */
    "@next/next/no-html-link-for-pages": "off",
    "@next/next/no-img-element": "off",

    /* --- Import Hygiene --- */
    "import/extensions": ["error", "never", { ts: "never", tsx: "never" }],
    "import/no-unresolved": "off",

    /* --- General --- */
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": "off", // handled by TS rule
  },
}];
