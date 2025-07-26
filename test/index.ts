import Mocha = require("mocha");
import glob = require("glob");
import * as path from "path";

export async function run(): Promise<void> {
  // Create the Mocha test runner
  const mocha = new Mocha({
    ui: "bdd",
    color: true,
    timeout: 20000,
  });

  const testsRoot = __dirname;
  const files = await glob.glob("**/*.test.js", { cwd: testsRoot });
  files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

  return new Promise((resolve, reject) => {
    try {
      mocha.run((failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
