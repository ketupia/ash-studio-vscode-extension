/**
 * Centralized error handling and recovery system for Ash Studio
 * Provides structured error types, handling, and recovery strategies
 */

import { Logger } from "./logger";

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorCategory {
  PARSING = "parsing",
  CONFIGURATION = "configuration",
  FILE_SYSTEM = "file-system",
  PERFORMANCE = "performance",
  USER_INTERACTION = "user-interaction",
  INTERNAL = "internal",
}

export interface AshStudioError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  component: string;
  timestamp: number;
  originalError?: Error;
  metadata?: Record<string, any>;
  recoveryAction?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private logger = Logger.getInstance();
  private errors: AshStudioError[] = [];
  private readonly maxErrors = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error with appropriate logging and recovery
   */
  handleError(
    category: ErrorCategory,
    severity: ErrorSeverity,
    component: string,
    message: string,
    originalError?: Error,
    metadata?: Record<string, any>
  ): AshStudioError {
    const error: AshStudioError = {
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
  async safeExecute<T>(
    operation: () => Promise<T>,
    component: string,
    category: ErrorCategory = ErrorCategory.INTERNAL,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(
        category,
        ErrorSeverity.MEDIUM,
        component,
        `Operation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error : undefined
      );
      return fallback;
    }
  }

  /**
   * Create a safe wrapper for synchronous operations
   */
  safeExecuteSync<T>(
    operation: () => T,
    component: string,
    category: ErrorCategory = ErrorCategory.INTERNAL,
    fallback?: T
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      this.handleError(
        category,
        ErrorSeverity.MEDIUM,
        component,
        `Operation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error : undefined
      );
      return fallback;
    }
  }

  private generateErrorId(): string {
    return `ash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private recordError(error: AshStudioError): void {
    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  private logError(error: AshStudioError): void {
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

  private getRecoveryAction(
    category: ErrorCategory,
    severity: ErrorSeverity
  ): string {
    const recoveryActions: Record<
      ErrorCategory,
      Record<ErrorSeverity, string>
    > = {
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

  private attemptRecovery(error: AshStudioError): void {
    // Implement specific recovery actions based on error type
    switch (error.category) {
      case ErrorCategory.PARSING:
        if (
          error.severity === ErrorSeverity.HIGH ||
          error.severity === ErrorSeverity.CRITICAL
        ) {
          // Could implement parser service restart here
          this.logger.info(
            "ErrorHandler",
            `Attempting recovery: ${error.recoveryAction}`
          );
        }
        break;

      case ErrorCategory.CONFIGURATION:
        if (
          error.severity === ErrorSeverity.MEDIUM ||
          error.severity === ErrorSeverity.HIGH
        ) {
          // Could implement configuration reset here
          this.logger.info(
            "ErrorHandler",
            `Attempting recovery: ${error.recoveryAction}`
          );
        }
        break;

      default:
        // Generic recovery
        this.logger.debug(
          "ErrorHandler",
          `Recovery action for ${error.category}: ${error.recoveryAction}`
        );
    }
  }

  /**
   * Get recent errors for diagnostic purposes
   */
  getRecentErrors(timeWindowMs: number = 300000): AshStudioError[] {
    // Default: 5 minutes
    const now = Date.now();
    return this.errors.filter(e => now - e.timestamp <= timeWindowMs);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

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
  clearErrors(): void {
    this.errors = [];
  }
}
