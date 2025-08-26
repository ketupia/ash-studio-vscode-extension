#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const mediaDir = path.join(root, "media");
const files = [
  path.join(mediaDir, "mermaid.min.js"),
  path.join(mediaDir, "svg-pan-zoom.min.js"),
];

let missing = [];
for (const f of files) {
  if (!fs.existsSync(f)) missing.push(path.relative(root, f));
}

if (missing.length) {
  console.error(
    "[Ash Studio] Missing media assets after build:",
    missing.join(", ")
  );
  process.exit(1);
} else {
  console.log("[Ash Studio] Media assets verified.");
}
