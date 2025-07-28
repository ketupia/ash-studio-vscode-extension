/**
 * Configuration management for Ash Studio extension
 * Provides type-safe access to extension settings
 */

import * as vscode from "vscode";
import { LogLevel } from "./logger";

export interface AshStudioConfig {
  logLevel: LogLevel;
  enablePerformanceMetrics: boolean;
  sidebarAutoRefresh: boolean;
  parseDebounceMs: number;
  maxCacheSize: number;
  enableCodeLens: boolean;
  enableHoverInfo: boolean;
}

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private readonly configSection = "ashStudio";

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private getConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(this.configSection);
  }

  get<T extends keyof AshStudioConfig>(key: T): AshStudioConfig[T] {
    const config = this.getConfig();
    switch (key) {
      case "logLevel":
        return config.get("logLevel", LogLevel.INFO) as AshStudioConfig[T];
      case "enablePerformanceMetrics":
        return config.get(
          "enablePerformanceMetrics",
          false
        ) as AshStudioConfig[T];
      case "sidebarAutoRefresh":
        return config.get("sidebarAutoRefresh", true) as AshStudioConfig[T];
      case "parseDebounceMs":
        return config.get("parseDebounceMs", 300) as AshStudioConfig[T];
      case "maxCacheSize":
        return config.get("maxCacheSize", 100) as AshStudioConfig[T];
      case "enableCodeLens":
        return config.get("enableCodeLens", false) as AshStudioConfig[T];
      case "enableHoverInfo":
        return config.get("enableHoverInfo", false) as AshStudioConfig[T];
      default:
        throw new Error(`Unknown configuration key: ${key}`);
    }
  }

  async set<T extends keyof AshStudioConfig>(
    key: T,
    value: AshStudioConfig[T],
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
  ): Promise<void> {
    const config = this.getConfig();
    await config.update(key, value, target);
  }

  onDidChange(
    listener: (e: vscode.ConfigurationChangeEvent) => void
  ): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(this.configSection)) {
        listener(e);
      }
    });
  }

  // Get all configuration as a typed object
  getAll(): AshStudioConfig {
    return {
      logLevel: this.get("logLevel"),
      enablePerformanceMetrics: this.get("enablePerformanceMetrics"),
      sidebarAutoRefresh: this.get("sidebarAutoRefresh"),
      parseDebounceMs: this.get("parseDebounceMs"),
      maxCacheSize: this.get("maxCacheSize"),
      enableCodeLens: this.get("enableCodeLens"),
      enableHoverInfo: this.get("enableHoverInfo"),
    };
  }
}
