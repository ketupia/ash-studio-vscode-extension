#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const mediaDir = path.join(root, "media");
const files = [
  path.join(mediaDir, "mermaid.min.js"),
  path.join(mediaDir, "svg-pan-zoom.min.js"),
];

// Explicitly require packages that are only used as media assets so static analyzers
// (like knip) recognize them as project dependencies. We don't rely on their exports
// here — just ensure they're present in node_modules during checks.
try {
  require("mermaid");
} catch (e) {
  // ignore; presence is the important part for knip
}
try {
  require("svg-pan-zoom");
} catch (e) {
  // ignore; presence is the important part for knip
}

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
