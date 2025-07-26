const { parseAshDocumentSimple } = require("./dist/src/simpleParser");
const fs = require("fs");

// Test the enhanced simple parser on track.ex
const trackContent = fs.readFileSync("./examples/resources/track.ex", "utf8");

console.log("=== Testing Enhanced Simple Parser ===");

const result = parseAshDocumentSimple({
  getText: () => trackContent,
  uri: { toString: () => "test://track.ex" },
  version: 1,
});

console.log("Is Ash File:", result.isAshFile);
console.log("Sections found:", result.sections?.length || 0);
console.log("Errors:", result.errors?.length || 0);

if (result.sections && result.sections.length > 0) {
  console.log("\n=== Sections with Children ===");
  result.sections.forEach((section, index) => {
    console.log(
      `\n${index + 1}. ${section.name} (${
        section.children?.length || 0
      } children)`
    );

    if (section.children && section.children.length > 0) {
      section.children.forEach((child, childIndex) => {
        console.log(`   ${childIndex + 1}. ${child.name} (${child.macroName})`);
      });
    }
  });
}
