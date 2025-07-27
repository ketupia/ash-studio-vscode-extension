import globals from "globals";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    // Ignore VS Code test files and generated files
    ignores: [
      ".vscode-test/**/*",
      "dist/**/*",
      "node_modules/**/*",
      "**/*.min.js",
      "src/nearley/ashGrammar.js", // Generated Nearley grammar
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
        ...globals.mocha,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-const-assign": "error",
      "no-this-before-super": "error",
      "no-undef": "error",
      "no-unreachable": "error",
      "no-unused-vars": "warn",
      "constructor-super": "error",
      "valid-typeof": "error",
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      "no-const-assign": "error",
      "no-this-before-super": "error",
      "no-undef": "off", // TypeScript handles this
      "no-unreachable": "error",
      "no-unused-vars": "off", // Use TypeScript version
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "constructor-super": "error",
      "valid-typeof": "error",
    },
  },
];
