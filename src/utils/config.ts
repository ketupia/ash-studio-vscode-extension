/**
 * Configuration management for Ash Studio extension
 * Provides type-safe access to extension settings
 */

import * as vscode from "vscode";
import { LogLevel } from "./logger";

export interface AshStudioConfig {
  logLevel: LogLevel;
  enableCodeLens: boolean;
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
      case "enableCodeLens":
        return config.get("enableCodeLens", false) as AshStudioConfig[T];
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
      enableCodeLens: this.get("enableCodeLens"),
    };
  }
}
