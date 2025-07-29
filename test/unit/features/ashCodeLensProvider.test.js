const assert = require("assert");
const vscode = require("vscode");
const sinon = require("sinon");
const {
  AshCodeLensProvider,
} = require("../../../dist/src/features/ashCodeLensProvider");

describe("AshCodeLensProvider", function () {
  let mockParserService;
  let mockConfig;
  let provider;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock the configuration manager
    mockConfig = {
      get: sandbox.stub().returns(true), // enableCodeLens: true
    };

    sandbox.stub(global, "require").callsFake(module => {
      if (module === "../utils/config") {
        return {
          ConfigurationManager: {
            getInstance: () => mockConfig,
          },
        };
      }
      return require(module);
    });

    // Mock parser service
    mockParserService = {
      getParseResult: sandbox.stub(),
      onDidParse: sandbox.stub().returns({ dispose: () => {} }),
    };

    provider = new AshCodeLensProvider(mockParserService);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("provideCodeLenses", () => {
    it("should return null when CodeLens is disabled", async () => {
      mockConfig.get.returns(false); // enableCodeLens: false

      const result = await provider.provideCodeLenses(
        { uri: "test.ex" },
        new vscode.CancellationTokenSource().token
      );

      assert.strictEqual(result, null);
    });

    it("should return null when parse result is null", async () => {
      mockParserService.getParseResult.resolves(null);

      const result = await provider.provideCodeLenses(
        { uri: "test.ex" },
        new vscode.CancellationTokenSource().token
      );

      assert.strictEqual(result, null);
    });

    it("should return null when document is not an Ash file", async () => {
      mockParserService.getParseResult.resolves({
        isAshFile: false,
        codeLenses: [],
      });

      const result = await provider.provideCodeLenses(
        { uri: "test.ex" },
        new vscode.CancellationTokenSource().token
      );

      assert.strictEqual(result, null);
    });

    it("should return CodeLenses for Ash file with code lenses", async () => {
      mockParserService.getParseResult.resolves({
        isAshFile: true,
        codeLenses: [
          {
            line: 5,
            character: 10,
            title: "Documentation for resource",
            target: "https://hexdocs.pm/ash/Ash.Resource.html",
            source: "AshResource - resource",
          },
          {
            line: 15,
            character: 8,
            title: "Documentation for authentication",
            target: "https://hexdocs.pm/ash/Ash.Authentication.html",
            source: "AshAuthentication - authentication",
          },
        ],
      });

      // Mock the command service since CodeLens depends on it
      sandbox.stub(vscode.commands, "executeCommand").resolves();

      const result = await provider.provideCodeLenses(
        { uri: "test.ex" },
        new vscode.CancellationTokenSource().token
      );

      assert.notStrictEqual(result, null);
      assert.strictEqual(result.length, 2);

      // Verify CodeLens properties
      assert.strictEqual(result[0].command.title, "Documentation for resource");
      assert.strictEqual(result[0].command.command, "vscode.open");
      assert.strictEqual(
        result[1].command.title,
        "Documentation for authentication"
      );
      assert.strictEqual(result[1].command.command, "vscode.open");
    });

    it("should handle errors gracefully", async () => {
      mockParserService.getParseResult.rejects(new Error("Test error"));

      // Create a logger mock to capture errors
      const loggerStub = {
        error: sandbox.stub(),
      };
      sandbox.stub(global, "require").callsFake(module => {
        if (module === "../utils/logger") {
          return {
            Logger: {
              getInstance: () => loggerStub,
            },
          };
        }
        return require(module);
      });

      const result = await provider.provideCodeLenses(
        { uri: "test.ex" },
        new vscode.CancellationTokenSource().token
      );

      assert.strictEqual(result, null);
      assert.strictEqual(loggerStub.error.calledOnce, true);
    });
  });
});
