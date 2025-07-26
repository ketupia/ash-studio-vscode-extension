const fs = require("fs");

const trackContent = fs.readFileSync("./examples/resources/track.ex", "utf8");
const lines = trackContent.split("\n");

console.log("=== Line-by-line analysis around error position ===");
console.log("Error at line 9, column 11 (1-based)");
console.log("Error at line 8, column 10 (0-based)");
console.log("");

for (let i = 6; i < 12 && i < lines.length; i++) {
  const lineNum = i + 1;
  const line = lines[i];
  console.log(`Line ${lineNum}: "${line}"`);

  if (lineNum === 9) {
    const pointer = " ".repeat(10) + "^";
    console.log(`         ${pointer} (column 11)`);
  }
}

console.log("\n=== Character analysis at error position ===");
const errorLine = lines[8]; // Line 9 (0-based index 8)
const errorCol = 10; // Column 11 (0-based index 10)
console.log("Error line content:", JSON.stringify(errorLine));
console.log(
  "Character at error position:",
  JSON.stringify(errorLine[errorCol])
);
console.log("Characters around error:");
for (
  let i = Math.max(0, errorCol - 5);
  i < Math.min(errorLine.length, errorCol + 5);
  i++
) {
  const marker = i === errorCol ? " <-- ERROR" : "";
  console.log(`  [${i}]: ${JSON.stringify(errorLine[i])}${marker}`);
}
