/**
 * Centralized logging service for Ash Studio extension
 * Provides structured logging with configurable levels and output channels
 */

import * as vscode from "vscode";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel("Ash Studio");
    // Read log level from configuration
    const config = vscode.workspace.getConfiguration("ashStudio");
    this.logLevel = config.get<LogLevel>("logLevel", LogLevel.INFO);
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(
    level: LogLevel,
    component: string,
    message: string,
    data?: any
  ): void {
    if (level > this.logLevel) return;

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
      const consoleMethod =
        level === LogLevel.ERROR
          ? "error"
          : level === LogLevel.WARN
            ? "warn"
            : "log";
      console[consoleMethod](
        `[Ash Studio] [${component}]`,
        message,
        data || ""
      );
    }
  }

  error(component: string, message: string, error?: Error | any): void {
    this.log(LogLevel.ERROR, component, message, error);
  }

  warn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data);
  }

  info(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data);
  }

  debug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  show(): void {
    this.outputChannel.show();
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}
