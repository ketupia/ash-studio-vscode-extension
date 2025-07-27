/**
 * Performance monitoring and metrics collection for Ash Studio
 * Tracks parser performance, cache hit rates, and extension responsiveness
 */

import { Logger } from "./logger";
import { ConfigurationManager } from "./config";

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
  metadata?: Record<string, any>;
}

interface AggregatedMetrics {
  totalOperations: number;
  averageDuration: number;
  successRate: number;
  p95Duration: number;
  p99Duration: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private logger = Logger.getInstance();
  private config = ConfigurationManager.getInstance();
  private readonly maxMetrics = 1000; // Keep last 1000 operations

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Create a performance timer for an operation
   */
  startTimer(operationName: string, metadata?: Record<string, any>) {
    if (!this.config.get("enablePerformanceMetrics")) {
      return { end: () => {} }; // No-op if disabled
    }

    const startTime = performance.now();

    return {
      end: (
        success: boolean = true,
        additionalMetadata?: Record<string, any>
      ) => {
        const duration = performance.now() - startTime;
        const metric: PerformanceMetric = {
          name: operationName,
          duration,
          timestamp: Date.now(),
          success,
          metadata: { ...metadata, ...additionalMetadata },
        };

        this.recordMetric(metric);
      },
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (metric.duration > 1000) {
      // > 1 second
      this.logger.warn(
        "Performance",
        `Slow operation detected: ${metric.name} took ${metric.duration.toFixed(
          2
        )}ms`,
        metric.metadata
      );
    }

    // Log very slow operations as errors
    if (metric.duration > 5000) {
      // > 5 seconds
      this.logger.error(
        "Performance",
        `Very slow operation: ${metric.name} took ${metric.duration.toFixed(
          2
        )}ms`,
        metric.metadata
      );
    }
  }

  /**
   * Get aggregated metrics for an operation
   */
  getMetrics(operationName: string, timeWindowMs?: number): AggregatedMetrics {
    const now = Date.now();
    let filteredMetrics = this.metrics.filter((m) => m.name === operationName);

    if (timeWindowMs) {
      filteredMetrics = filteredMetrics.filter(
        (m) => now - m.timestamp <= timeWindowMs
      );
    }

    if (filteredMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        successRate: 0,
        p95Duration: 0,
        p99Duration: 0,
      };
    }

    const durations = filteredMetrics
      .map((m) => m.duration)
      .sort((a, b) => a - b);
    const successCount = filteredMetrics.filter((m) => m.success).length;

    return {
      totalOperations: filteredMetrics.length,
      averageDuration:
        durations.reduce((sum, d) => sum + d, 0) / durations.length,
      successRate: successCount / filteredMetrics.length,
      p95Duration: durations[Math.floor(durations.length * 0.95)] || 0,
      p99Duration: durations[Math.floor(durations.length * 0.99)] || 0,
    };
  }

  /**
   * Get performance summary for all operations
   */
  getPerformanceSummary(): Record<string, AggregatedMetrics> {
    const operationNames = [...new Set(this.metrics.map((m) => m.name))];
    const summary: Record<string, AggregatedMetrics> = {};

    for (const name of operationNames) {
      summary[name] = this.getMetrics(name);
    }

    return summary;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Log performance summary to output
   */
  logPerformanceSummary(): void {
    const summary = this.getPerformanceSummary();
    this.logger.info("Performance", "Performance Summary", summary);
  }
}

/**
 * Decorator function for measuring method performance
 */
export function measurePerformance(
  operationName: string,
  metadata?: Record<string, any>
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      const timer = monitor.startTimer(operationName, metadata);

      try {
        const result = await originalMethod.apply(this, args);
        timer.end(true);
        return result;
      } catch (error) {
        timer.end(false, {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    };

    return descriptor;
  };
}
