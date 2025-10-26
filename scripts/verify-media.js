const fs = require("fs");
const path = require("path");

// Files we expect to exist in the built output
const expectedFiles = ["dist/src/vscode/ui/templates/mermaidWebview.html"];

let missing = [];
for (const rel of expectedFiles) {
  const full = path.resolve(rel);
  if (!fs.existsSync(full)) {
    missing.push(rel);
  }
}

if (missing.length === 0) {
  console.log("verify-media: OK — all expected media/templates are present");
  process.exit(0);
} else {
  console.error("verify-media: FAILED — missing the following files:");
  for (const m of missing) console.error("  -", m);
  process.exit(2);
}
