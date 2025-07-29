// Set up Mocha for the electron test environment
import Mocha = require("mocha");

export function run(): Promise<void> {
  return new Promise((c, e) => {
    // Create the mocha test
    const mocha = new Mocha({
      ui: "bdd",
      color: true,
    });

    const testsRoot = __dirname;

    // Add test files
    mocha.addFile(`${testsRoot}/unit/parsers/parserService.test.js`);
    // mocha.addFile(`${testsRoot}/integration/parser-service.test.js`); // Add when ready

    try {
      // Run the mocha test
      mocha.run((failures: number) => {
        if (failures > 0) {
          e(new Error(`${failures} tests failed.`));
        } else {
          c();
        }
      });
    } catch (err) {
      console.error(err);
      e(err);
    }
  });
}
