"use strict";
/**
 * Configuration management for Ash Studio extension
 * Provides type-safe access to extension settings
 */
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
exports.ConfigurationManager = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("./logger");
class ConfigurationManager {
    static instance;
    configSection = "ashStudio";
    static getInstance() {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }
    getConfig() {
        return vscode.workspace.getConfiguration(this.configSection);
    }
    get(key) {
        const config = this.getConfig();
        switch (key) {
            case "logLevel":
                return config.get("logLevel", logger_1.LogLevel.INFO);
            case "parserStrategy":
                return config.get("parserStrategy", "hybrid");
            case "enablePerformanceMetrics":
                return config.get("enablePerformanceMetrics", false);
            case "sidebarAutoRefresh":
                return config.get("sidebarAutoRefresh", true);
            case "parseDebounceMs":
                return config.get("parseDebounceMs", 300);
            case "maxCacheSize":
                return config.get("maxCacheSize", 100);
            case "enableCodeLens":
                return config.get("enableCodeLens", false);
            case "enableHoverInfo":
                return config.get("enableHoverInfo", false);
            default:
                throw new Error(`Unknown configuration key: ${key}`);
        }
    }
    async set(key, value, target = vscode.ConfigurationTarget.Global) {
        const config = this.getConfig();
        await config.update(key, value, target);
    }
    onDidChange(listener) {
        return vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(this.configSection)) {
                listener(e);
            }
        });
    }
    // Get all configuration as a typed object
    getAll() {
        return {
            logLevel: this.get("logLevel"),
            parserStrategy: this.get("parserStrategy"),
            enablePerformanceMetrics: this.get("enablePerformanceMetrics"),
            sidebarAutoRefresh: this.get("sidebarAutoRefresh"),
            parseDebounceMs: this.get("parseDebounceMs"),
            maxCacheSize: this.get("maxCacheSize"),
            enableCodeLens: this.get("enableCodeLens"),
            enableHoverInfo: this.get("enableHoverInfo"),
        };
    }
}
exports.ConfigurationManager = ConfigurationManager;
