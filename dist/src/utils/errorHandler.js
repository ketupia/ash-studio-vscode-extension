"use strict";
/**
 * Centralized error handling and recovery system for Ash Studio
 * Provides structured error types, handling, and recovery strategies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.ErrorCategory = exports.ErrorSeverity = void 0;
const logger_1 = require("./logger");
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["PARSING"] = "parsing";
    ErrorCategory["CONFIGURATION"] = "configuration";
    ErrorCategory["FILE_SYSTEM"] = "file-system";
    ErrorCategory["PERFORMANCE"] = "performance";
    ErrorCategory["USER_INTERACTION"] = "user-interaction";
    ErrorCategory["INTERNAL"] = "internal";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
class ErrorHandler {
    static instance;
    logger = logger_1.Logger.getInstance();
    errors = [];
    maxErrors = 100;
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    /**
     * Handle an error with appropriate logging and recovery
     */
    handleError(category, severity, component, message, originalError, metadata) {
        const error = {
            id: this.generateErrorId(),
            category,
            severity,
            message,
            component,
            timestamp: Date.now(),
            originalError,
            metadata,
            recoveryAction: this.getRecoveryAction(category, severity),
        };
        this.recordError(error);
        this.logError(error);
        this.attemptRecovery(error);
        return error;
    }
    /**
     * Create a safe wrapper for operations that might fail
     */
    async safeExecute(operation, component, category = ErrorCategory.INTERNAL, fallback) {
        try {
            return await operation();
        }
        catch (error) {
            this.handleError(category, ErrorSeverity.MEDIUM, component, `Operation failed: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error : undefined);
            return fallback;
        }
    }
    /**
     * Create a safe wrapper for synchronous operations
     */
    safeExecuteSync(operation, component, category = ErrorCategory.INTERNAL, fallback) {
        try {
            return operation();
        }
        catch (error) {
            this.handleError(category, ErrorSeverity.MEDIUM, component, `Operation failed: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error : undefined);
            return fallback;
        }
    }
    generateErrorId() {
        return `ash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    recordError(error) {
        this.errors.push(error);
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }
    }
    logError(error) {
        const logData = {
            id: error.id,
            category: error.category,
            severity: error.severity,
            metadata: error.metadata,
            stack: error.originalError?.stack,
        };
        switch (error.severity) {
            case ErrorSeverity.CRITICAL:
                this.logger.error(error.component, error.message, logData);
                break;
            case ErrorSeverity.HIGH:
                this.logger.error(error.component, error.message, logData);
                break;
            case ErrorSeverity.MEDIUM:
                this.logger.warn(error.component, error.message, logData);
                break;
            case ErrorSeverity.LOW:
                this.logger.info(error.component, error.message, logData);
                break;
        }
    }
    getRecoveryAction(category, severity) {
        const recoveryActions = {
            [ErrorCategory.PARSING]: {
                [ErrorSeverity.LOW]: "Continue with simple parser fallback",
                [ErrorSeverity.MEDIUM]: "Use simple parser and notify user",
                [ErrorSeverity.HIGH]: "Disable parsing for this file",
                [ErrorSeverity.CRITICAL]: "Restart parser service",
            },
            [ErrorCategory.CONFIGURATION]: {
                [ErrorSeverity.LOW]: "Use default configuration",
                [ErrorSeverity.MEDIUM]: "Reset to defaults and notify user",
                [ErrorSeverity.HIGH]: "Show configuration error dialog",
                [ErrorSeverity.CRITICAL]: "Disable extension until fixed",
            },
            [ErrorCategory.FILE_SYSTEM]: {
                [ErrorSeverity.LOW]: "Retry operation once",
                [ErrorSeverity.MEDIUM]: "Skip file and continue",
                [ErrorSeverity.HIGH]: "Show file access error",
                [ErrorSeverity.CRITICAL]: "Disable file watching",
            },
            [ErrorCategory.PERFORMANCE]: {
                [ErrorSeverity.LOW]: "Log performance warning",
                [ErrorSeverity.MEDIUM]: "Optimize next operation",
                [ErrorSeverity.HIGH]: "Reduce parsing frequency",
                [ErrorSeverity.CRITICAL]: "Switch to simple parser only",
            },
            [ErrorCategory.USER_INTERACTION]: {
                [ErrorSeverity.LOW]: "Show info message",
                [ErrorSeverity.MEDIUM]: "Show warning message",
                [ErrorSeverity.HIGH]: "Show error message",
                [ErrorSeverity.CRITICAL]: "Show error with restart option",
            },
            [ErrorCategory.INTERNAL]: {
                [ErrorSeverity.LOW]: "Log and continue",
                [ErrorSeverity.MEDIUM]: "Log and continue with fallback",
                [ErrorSeverity.HIGH]: "Reset component state",
                [ErrorSeverity.CRITICAL]: "Restart extension",
            },
        };
        return recoveryActions[category]?.[severity] || "Log and continue";
    }
    attemptRecovery(error) {
        // Implement specific recovery actions based on error type
        switch (error.category) {
            case ErrorCategory.PARSING:
                if (error.severity === ErrorSeverity.HIGH ||
                    error.severity === ErrorSeverity.CRITICAL) {
                    // Could implement parser service restart here
                    this.logger.info("ErrorHandler", `Attempting recovery: ${error.recoveryAction}`);
                }
                break;
            case ErrorCategory.CONFIGURATION:
                if (error.severity === ErrorSeverity.MEDIUM ||
                    error.severity === ErrorSeverity.HIGH) {
                    // Could implement configuration reset here
                    this.logger.info("ErrorHandler", `Attempting recovery: ${error.recoveryAction}`);
                }
                break;
            default:
                // Generic recovery
                this.logger.debug("ErrorHandler", `Recovery action for ${error.category}: ${error.recoveryAction}`);
        }
    }
    /**
     * Get recent errors for diagnostic purposes
     */
    getRecentErrors(timeWindowMs = 300000) {
        // Default: 5 minutes
        const now = Date.now();
        return this.errors.filter((e) => now - e.timestamp <= timeWindowMs);
    }
    /**
     * Get error statistics
     */
    getErrorStats() {
        const byCategory = {};
        const bySeverity = {};
        for (const error of this.errors) {
            byCategory[error.category] = (byCategory[error.category] || 0) + 1;
            bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
        }
        return {
            total: this.errors.length,
            byCategory,
            bySeverity,
        };
    }
    /**
     * Clear all recorded errors
     */
    clearErrors() {
        this.errors = [];
    }
}
exports.ErrorHandler = ErrorHandler;
