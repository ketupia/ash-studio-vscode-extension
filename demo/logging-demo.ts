/**
 * Test file to demonstrate centralized logging functionality
 * This file shows how the new logging system works in practice
 */

import * as vscode from "vscode";
import { Logger, LogLevel } from "../src/utils/logger";
import { ConfigurationManager } from "../src/utils/config";
import { AshParserService } from "../src/ashParserService";

// Mock TextDocument for demonstration
function createMockDocument(
  content: string,
  fileName: string = "test.ex"
): vscode.TextDocument {
  return {
    getText: () => content,
    fileName,
    languageId: "elixir",
    uri: vscode.Uri.file(fileName),
    version: 1,
  } as vscode.TextDocument;
}

/**
 * Demonstrate the centralized logging system
 */
async function demonstrateLogging() {
  console.log("🧪 Demonstrating Ash Studio Centralized Logging System");
  console.log("=".repeat(60));

  // Initialize services
  const logger = Logger.getInstance();
  const config = ConfigurationManager.getInstance();
  const parserService = AshParserService.getInstance();

  // Set log level to DEBUG for demonstration
  logger.setLogLevel(LogLevel.DEBUG);

  console.log("\n📊 Current Configuration:");
  console.log(`Log Level: ${config.get("logLevel")}`);
  console.log(`Parser Strategy: ${config.get("parserStrategy")}`);
  console.log(`Performance Metrics: ${config.get("enablePerformanceMetrics")}`);

  console.log("\n🔍 Testing Logging Levels:");

  // Test different log levels
  logger.error("LogDemo", "This is an ERROR level message", {
    severity: "critical",
  });
  logger.warn("LogDemo", "This is a WARN level message", {
    issue: "performance degradation",
  });
  logger.info("LogDemo", "This is an INFO level message", {
    status: "operation completed",
  });
  logger.debug("LogDemo", "This is a DEBUG level message", {
    details: "internal state",
  });

  console.log("\n📝 Testing Parser Integration:");

  // Test with a simple Ash Resource
  const ashResource = `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    uuid_primary_key :id
    attribute :name, :string
    attribute :email, :string
  end

  actions do
    defaults [:create, :read, :update, :destroy]
  end
end`;

  const doc = createMockDocument(ashResource, "user.ex");
  logger.info("LogDemo", "Parsing Ash Resource document...", {
    fileName: doc.fileName,
  });

  // This will trigger the centralized logging in the parser service
  const result = parserService.getParseResult(doc);

  logger.info("LogDemo", "Parse operation completed", {
    isAshFile: result.isAshFile,
    sectionsFound: result.sections.length,
    errorsCount: result.errors.length,
  });

  console.log("\n🎯 Testing Error Scenarios:");

  // Test with malformed Ash code to trigger error logging
  const malformedAsh = `defmodule MyApp.Broken do
  use Ash.Resource

  attributes do
    attribute :name, :string
  # Missing 'end' - this should trigger fallback logging
end`;

  const brokenDoc = createMockDocument(malformedAsh, "broken.ex");
  logger.info(
    "LogDemo",
    "Parsing malformed document (should trigger fallback)...",
    { fileName: brokenDoc.fileName }
  );

  const brokenResult = parserService.getParseResult(brokenDoc);

  logger.info("LogDemo", "Malformed parse completed", {
    isAshFile: brokenResult.isAshFile,
    sectionsFound: brokenResult.sections.length,
    errorsCount: brokenResult.errors.length,
    fallbackUsed: true,
  });

  console.log("\n✅ Logging demonstration completed!");
  console.log(
    '📋 Check the "Ash Studio" output channel in VS Code to see structured logs'
  );
  console.log("⚙️  Change ashStudio.logLevel in settings to control verbosity");

  // Show the output channel
  logger.show();
}

// Export for potential use in tests
export { demonstrateLogging };

// If running directly, execute the demonstration
if (require.main === module) {
  demonstrateLogging().catch(console.error);
}
