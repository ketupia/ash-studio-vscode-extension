const fs = require("fs");

const trackContent = fs.readFileSync("./examples/resources/track.ex", "utf8");
const lines = trackContent.split("\n");

console.log("=== New error position analysis ===");
console.log("Error now at line 32, column 20 (1-based)");
console.log("Error now at line 31, column 19 (0-based)");
console.log("");

for (let i = 28; i < 35 && i < lines.length; i++) {
  const lineNum = i + 1;
  const line = lines[i];
  console.log(`Line ${lineNum}: "${line}"`);

  if (lineNum === 32) {
    const pointer = " ".repeat(19) + "^";
    console.log(`         ${pointer} (column 20)`);
  }
}

console.log("\n=== Progress so far ===");
console.log("Successfully parsed through:");
for (let i = 0; i < 32 && i < lines.length; i++) {
  const lineNum = i + 1;
  const line = lines[i].trim();
  if (line.match(/^\w+ do$/)) {
    console.log(`  ✅ DSL Section: ${line}`);
  } else if (line.match(/^(reference|type|table|repo|defaults)\(/)) {
    console.log(`  ✅ Simple Macro: ${line}`);
  }
}
