module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {
    "^vscode$": "<rootDir>/test/__mocks__/vscode.ts",
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};
