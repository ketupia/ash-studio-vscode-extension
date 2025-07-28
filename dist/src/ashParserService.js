"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AshParserService = void 0;
const vscode = __importStar(require("vscode"));
const ashParser_1 = require("./parsers/grammarBased/ashParser");
const simpleParser_1 = require("./parsers/regexBased/simpleParser");
const configurationDrivenParser_1 = require("./parsers/configurationDriven/configurationDrivenParser");
const logger_1 = require("./utils/logger");
/**
 * Centralized parser service that caches parse results and manages updates
 */
class AshParserService {
    static instance;
    parseCache = new Map();
    _onDidParse = new vscode.EventEmitter();
    // List of parsers to try in order - first one that succeeds wins
    parsers = [
        configurationDrivenParser_1.ConfigurationDrivenParser.getInstance(),
        ashParser_1.AshParser.getInstance(),
        new simpleParser_1.SimpleParser(),
    ];
    onDidParse = this._onDidParse.event;
    static getInstance() {
        if (!AshParserService.instance) {
            AshParserService.instance = new AshParserService();
        }
        return AshParserService.instance;
    }
    /**
     * Get parse result for a document, using cache if available
     */
    getParseResult(document) {
        const uri = document.uri.toString();
        const version = document.version;
        // Check if we have a cached result for this document version
        const cached = this.parseCache.get(uri);
        if (cached && cached.version === version) {
            return cached.result;
        }
        // Try parsers in order until one succeeds
        const source = document.getText();
        const logger = logger_1.Logger.getInstance();
        let result = null;
        for (const parser of this.parsers) {
            try {
                const parseResult = parser.parse(source);
                // Consider a parser successful if:
                // 1. It identifies the file as an Ash file, OR
                // 2. It's the last parser (fallback)
                const isLastParser = parser === this.parsers[this.parsers.length - 1];
                if (parseResult.isAshFile || isLastParser) {
                    logger.debug("AshParserService", `Parser ${parseResult.parserName} succeeded`, {
                        isAshFile: parseResult.isAshFile,
                        sectionsFound: parseResult.sections.length,
                        errorsFound: parseResult.errors.length,
                        isLastParser,
                    });
                    result = parseResult;
                    break;
                }
                else {
                    logger.debug("AshParserService", `Parser ${parseResult.parserName} did not identify file as Ash file, trying next parser`);
                }
            }
            catch (error) {
                logger.warn("AshParserService", `Parser failed with error, trying next parser`, {
                    error: error instanceof Error ? error.message : String(error),
                });
                // Continue to next parser
            }
        }
        // Fallback if no parser succeeded (shouldn't happen with SimpleParser as fallback)
        if (!result) {
            logger.error("AshParserService", "All parsers failed, using empty result");
            result = {
                sections: [],
                errors: [],
                isAshFile: false,
                parserName: "EmptyFallback",
            };
        }
        // Cache the result
        this.parseCache.set(uri, { result, version });
        // Notify listeners
        this._onDidParse.fire(result);
        return result;
    }
    /**
     * Clear cache for a specific document
     */
    clearCache(document) {
        const uri = document.uri.toString();
        this.parseCache.delete(uri);
    }
    /**
     * Clear all cached results
     */
    clearAllCache() {
        this.parseCache.clear();
    }
    /**
     * Get cached result without parsing (returns undefined if not cached)
     */
    getCachedResult(document) {
        const uri = document.uri.toString();
        const version = document.version;
        const cached = this.parseCache.get(uri);
        if (cached && cached.version === version) {
            return cached.result;
        }
        return undefined;
    }
    /**
     * Parse document only if it's an Elixir file, otherwise return empty result
     */
    parseElixirDocument(document) {
        // Skip non-Elixir files
        if (document.languageId !== "elixir") {
            return {
                sections: [],
                errors: [],
                isAshFile: false,
                parserName: "LanguageFilter",
            };
        }
        return this.getParseResult(document);
    }
}
exports.AshParserService = AshParserService;
