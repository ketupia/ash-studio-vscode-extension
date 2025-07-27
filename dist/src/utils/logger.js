"use strict";
/**
 * Centralized logging service for Ash Studio extension
 * Provides structured logging with configurable levels and output channels
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
exports.Logger = exports.LogLevel = void 0;
const vscode = __importStar(require("vscode"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    static instance;
    outputChannel;
    logLevel = LogLevel.INFO;
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel("Ash Studio");
        // Read log level from configuration
        const config = vscode.workspace.getConfiguration("ashStudio");
        this.logLevel = config.get("logLevel", LogLevel.INFO);
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    log(level, component, message, data) {
        if (level > this.logLevel)
            return;
        const timestamp = new Date().toISOString();
        const levelStr = LogLevel[level];
        const logMessage = `[${timestamp}] [${levelStr}] [${component}] ${message}`;
        // Log to output channel
        this.outputChannel.appendLine(logMessage);
        if (data) {
            this.outputChannel.appendLine(JSON.stringify(data, null, 2));
        }
        // Also log to console for development
        if (process.env.NODE_ENV === "development") {
            const consoleMethod = level === LogLevel.ERROR
                ? "error"
                : level === LogLevel.WARN
                    ? "warn"
                    : "log";
            console[consoleMethod](`[Ash Studio] [${component}]`, message, data || "");
        }
    }
    error(component, message, error) {
        this.log(LogLevel.ERROR, component, message, error);
    }
    warn(component, message, data) {
        this.log(LogLevel.WARN, component, message, data);
    }
    info(component, message, data) {
        this.log(LogLevel.INFO, component, message, data);
    }
    debug(component, message, data) {
        this.log(LogLevel.DEBUG, component, message, data);
    }
    show() {
        this.outputChannel.show();
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
}
exports.Logger = Logger;
