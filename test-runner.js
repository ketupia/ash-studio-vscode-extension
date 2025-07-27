#!/usr/bin/env node

/**
 * Enhanced Test Runner for Ash Studio
 * Provides clear test results and improved output formatting
 */

const { spawn } = require("child_process");

console.log("🚀 Ash Studio Test Suite\n");
console.log("═".repeat(50));

// Build the project first
console.log("📦 Building project...");
const buildProcess = spawn("npm", ["run", "build"], {
  stdio: "inherit",
  shell: true,
  cwd: __dirname,
});

buildProcess.on("close", buildCode => {
  if (buildCode !== 0) {
    console.error("❌ Build failed");
    process.exit(1);
  }

  console.log("✅ Build completed\n");
  console.log("🧪 Running parser tests...");
  console.log("─".repeat(30));

  // Run the parser tests
  const testProcess = spawn(
    "npx",
    ["mocha", "test/parser.test.js", "--reporter", "spec"],
    {
      stdio: "inherit",
      shell: true,
      cwd: __dirname,
    }
  );

  testProcess.on("close", testCode => {
    console.log("\n" + "─".repeat(30));

    if (testCode === 0) {
      console.log("🎉 All tests passed!");
      console.log("\n💡 To run VS Code extension tests: npm run test:vscode");
    } else {
      console.log("❌ Some tests failed");
      console.log("\n💡 Check the output above for details");
    }

    console.log("═".repeat(50));
    process.exit(testCode);
  });
});
