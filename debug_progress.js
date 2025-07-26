const fs = require("fs");

const trackContent = fs.readFileSync("./examples/resources/track.ex", "utf8");
const lines = trackContent.split("\n");

console.log("=== Line analysis around new error position ===");
console.log("New error at line 25, column 24 (1-based)");
console.log("New error at line 24, column 23 (0-based)");
console.log("");

for (let i = 22; i < 28 && i < lines.length; i++) {
  const lineNum = i + 1;
  const line = lines[i];
  console.log(`Line ${lineNum}: "${line}"`);

  if (lineNum === 25) {
    const pointer = " ".repeat(23) + "^";
    console.log(`         ${pointer} (column 24)`);
  }
}

console.log("\n=== Progress Analysis ===");
console.log("Parser successfully processed:");
for (let i = 0; i < 25 && i < lines.length; i++) {
  const lineNum = i + 1;
  if (lines[i].trim().match(/^\w+ do$/)) {
    console.log(`  ✅ DSL Section: ${lines[i].trim()}`);
  }
}
