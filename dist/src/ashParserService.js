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
const ashParser_1 = require("./ashParser");
const simpleParser_1 = require("./simpleParser");
const logger_1 = require("./utils/logger");
// Strategy: Try detailed parser first, fallback to simple parser on errors
const USE_GRACEFUL_FALLBACK = true;
/**
 * Centralized parser service that caches parse results and manages updates
 */
class AshParserService {
    static instance;
    parseCache = new Map();
    _onDidParse = new vscode.EventEmitter();
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
        // Parse the document with graceful fallback strategy
        let result;
        const logger = logger_1.Logger.getInstance();
        if (USE_GRACEFUL_FALLBACK) {
            try {
                // Pre-check for ANY complex patterns that might crash nearley
                const text = document.getText();
                // Skip grammar parser for files with any potentially problematic patterns
                const hasComplexExpr = text.includes("expr(");
                const hasStringInterpolation = text.includes("#{");
                const hasMultiLineStructures = text.includes("\n") && text.includes("do\n");
                const hasConditionalLogic = text.includes("if ") && text.includes("do:");
                const isLargeFile = text.length > 5000; // Skip large files entirely
                if (hasComplexExpr ||
                    hasStringInterpolation ||
                    hasMultiLineStructures ||
                    hasConditionalLogic ||
                    isLargeFile) {
                    logger.info("AshParserService", "Detected potentially problematic patterns, using simple parser only", {
                        hasComplexExpr,
                        hasStringInterpolation,
                        hasMultiLineStructures,
                        hasConditionalLogic,
                        isLargeFile,
                        fileSize: text.length,
                    });
                    result = (0, simpleParser_1.parseAshDocumentSimple)(document);
                }
                else {
                    // Only try grammar parser on very simple, small files
                    logger.debug("AshParserService", "File appears safe for grammar parser");
                    try {
                        result = (0, ashParser_1.parseAshDocument)(document);
                        if (result.errors && result.errors.length > 0) {
                            logger.info("AshParserService", "Grammar parser had errors, falling back to simple parser");
                            result = (0, simpleParser_1.parseAshDocumentSimple)(document);
                        }
                        else {
                            logger.debug("AshParserService", "Grammar parser succeeded");
                        }
                    }
                    catch (grammarError) {
                        logger.warn("AshParserService", "Grammar parser crashed, using simple parser", {
                            error: grammarError instanceof Error
                                ? grammarError.message
                                : String(grammarError),
                        });
                        result = (0, simpleParser_1.parseAshDocumentSimple)(document);
                    }
                }
            }
            catch (error) {
                // Ultimate fallback if anything goes wrong
                logger.error("AshParserService", "Parser service error, using emergency fallback", {
                    error: error instanceof Error ? error.message : String(error),
                });
                result = (0, simpleParser_1.parseAshDocumentSimple)(document);
            }
        }
        else {
            // Direct simple parser (for testing)
            result = (0, simpleParser_1.parseAshDocumentSimple)(document);
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
            };
        }
        return this.getParseResult(document);
    }
}
exports.AshParserService = AshParserService;
