// Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  // Start timing an operation
  startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      this.addMetric(name, duration, metadata);
    };
  }

  // Add a metric manually
  addMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    // Remove oldest metrics if we exceed the limit
    if (this.metrics.length >= this.maxMetrics) {
      this.metrics.shift();
    }

    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    });
  }

  // Get metrics for a specific operation
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name);
    }
    return [...this.metrics];
  }

  // Get average duration for an operation
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }

  // Get performance statistics
  getStats(name?: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    recent: number; // Last 10 operations average
  } {
    const metrics = this.getMetrics(name);
    
    if (metrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, recent: 0 };
    }

    const durations = metrics.map(m => m.duration);
    const recentMetrics = metrics.slice(-10);
    const recentDurations = recentMetrics.map(m => m.duration);

    return {
      count: metrics.length,
      average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      recent: recentDurations.length > 0 
        ? recentDurations.reduce((sum, d) => sum + d, 0) / recentDurations.length 
        : 0,
    };
  }

  // Clear all metrics
  clear(): void {
    this.metrics = [];
  }

  // Get slow operations (above threshold)
  getSlowOperations(thresholdMs: number = 1000): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.duration > thresholdMs);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common operations
export function measureApiCall<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const endTimer = performanceMonitor.startTimer(`api:${name}`);
  
  return operation()
    .then(result => {
      endTimer({ ...metadata, success: true });
      return result;
    })
    .catch(error => {
      endTimer({ ...metadata, success: false, error: error.message });
      throw error;
    });
}

export function measureDatabaseQuery<T>(
  queryName: string,
  query: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const endTimer = performanceMonitor.startTimer(`db:${queryName}`);
  
  return query()
    .then(result => {
      endTimer({ ...metadata, success: true });
      return result;
    })
    .catch(error => {
      endTimer({ ...metadata, success: false, error: error.message });
      throw error;
    });
}

// React hook for measuring component render time
export function useMeasureRender(componentName: string) {
  if (typeof window !== 'undefined') {
    const endTimer = performanceMonitor.startTimer(`render:${componentName}`);
    
    // Measure on next tick to capture full render
    setTimeout(() => {
      endTimer();
    }, 0);
  }
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  API_CALL: 2000, // 2 seconds
  DATABASE_QUERY: 1000, // 1 second
  COMPONENT_RENDER: 100, // 100ms
} as const;

// Log slow operations to console in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const slowOps = performanceMonitor.getSlowOperations(PERFORMANCE_THRESHOLDS.API_CALL);
    if (slowOps.length > 0) {
      console.warn('Slow operations detected:', slowOps);
    }
  }, 30000); // Check every 30 seconds
}

// Export performance data for monitoring
export function getPerformanceReport() {
  return {
    timestamp: new Date().toISOString(),
    apiCalls: performanceMonitor.getStats('api'),
    databaseQueries: performanceMonitor.getStats('db'),
    componentRenders: performanceMonitor.getStats('render'),
    slowOperations: performanceMonitor.getSlowOperations(),
    cacheStats: typeof window === 'undefined' ? require('./cache').cache.getStats() : null,
  };
}
