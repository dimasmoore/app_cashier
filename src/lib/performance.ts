

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  
  startTimer(name: string): (metadata?: Record<string, any>) => void {
    const startTime = performance.now();

    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      this.addMetric(name, duration, metadata);
    };
  }

  
  addMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    
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

  
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name);
    }
    return [...this.metrics];
  }

  
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }

  
  getStats(name?: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    recent: number; 
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

  
  clear(): void {
    this.metrics = [];
  }

  
  getSlowOperations(thresholdMs: number = 1000): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.duration > thresholdMs);
  }
}


export const performanceMonitor = new PerformanceMonitor();


export function measureApiCall<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const endTimer = performanceMonitor.startTimer(`api:${name}`);
  
  return operation()
    .then(result => {
      endTimer({ ...(metadata || {}), success: true });
      return result;
    })
    .catch(error => {
      endTimer({ ...(metadata || {}), success: false, error: error.message });
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
      endTimer({ ...(metadata || {}), success: true });
      return result;
    })
    .catch(error => {
      endTimer({ ...(metadata || {}), success: false, error: error.message });
      throw error;
    });
}


export function useMeasureRender(componentName: string) {
  if (typeof window !== 'undefined') {
    const endTimer = performanceMonitor.startTimer(`render:${componentName}`);
    
    
    setTimeout(() => {
      endTimer();
    }, 0);
  }
}


export const PERFORMANCE_THRESHOLDS = {
  API_CALL: 2000, 
  DATABASE_QUERY: 1000, 
  COMPONENT_RENDER: 100, 
} as const;


if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const slowOps = performanceMonitor.getSlowOperations(PERFORMANCE_THRESHOLDS.API_CALL);
    if (slowOps.length > 0) {
      console.warn('Slow operations detected:', slowOps);
    }
  }, 30000); 
}


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
