"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  navigationCount: number;
  memoryUsage?: number;
}

interface SidebarPerformanceMonitorProps {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export default function SidebarPerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  onMetricsUpdate 
}: SidebarPerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    navigationCount: 0,
  });

  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const pathname = usePathname();
  const previousPathname = useRef<string>(pathname);

  // Track renders
  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      renderTimes.current.push(renderTime);
      
      // Keep only last 10 render times for average calculation
      if (renderTimes.current.length > 10) {
        renderTimes.current = renderTimes.current.slice(-10);
      }

      const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      
      setMetrics(prev => {
        const newMetrics = {
          ...prev,
          renderCount: prev.renderCount + 1,
          lastRenderTime: renderTime,
          averageRenderTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize,
        };
        
        onMetricsUpdate?.(newMetrics);
        return newMetrics;
      });
    };
  });

  // Track navigation changes
  useEffect(() => {
    if (!enabled) return;

    if (previousPathname.current !== pathname) {
      setMetrics(prev => ({
        ...prev,
        navigationCount: prev.navigationCount + 1,
      }));
      previousPathname.current = pathname;
    }
  }, [pathname, enabled]);

  // Log metrics to console in development
  useEffect(() => {
    if (!enabled || !console.group) return;

    console.group('🔍 Sidebar Performance Metrics');
    console.log('📊 Render Count:', metrics.renderCount);
    console.log('⏱️ Last Render Time:', `${metrics.lastRenderTime.toFixed(2)}ms`);
    console.log('📈 Average Render Time:', `${metrics.averageRenderTime.toFixed(2)}ms`);
    console.log('🧭 Navigation Count:', metrics.navigationCount);
    if (metrics.memoryUsage) {
      console.log('💾 Memory Usage:', `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
    console.groupEnd();
  }, [metrics, enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-[10001] max-w-xs">
      <div className="text-yellow-400 font-bold mb-2">🔍 Sidebar Performance</div>
      <div className="space-y-1">
        <div>Renders: <span className="text-green-400">{metrics.renderCount}</span></div>
        <div>Last: <span className="text-blue-400">{metrics.lastRenderTime.toFixed(1)}ms</span></div>
        <div>Avg: <span className="text-purple-400">{metrics.averageRenderTime.toFixed(1)}ms</span></div>
        <div>Nav: <span className="text-orange-400">{metrics.navigationCount}</span></div>
        {metrics.memoryUsage && (
          <div>Mem: <span className="text-pink-400">{(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span></div>
        )}
      </div>
      <div className="text-gray-400 text-xs mt-2">
        Route: {pathname}
      </div>
    </div>
  );
}

// Hook for accessing performance metrics
export function useSidebarPerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  return {
    metrics,
    updateMetrics: setMetrics,
  };
}

// Performance test utilities
export const SidebarPerformanceUtils = {
  // Measure render performance
  measureRender: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    console.log(`🎯 ${componentName} render time: ${(end - start).toFixed(2)}ms`);
  },

  // Memory usage snapshot
  getMemorySnapshot: () => {
    if (!(performance as any).memory) {
      return null;
    }
    
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
      totalMB: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
    };
  },

  // Navigation performance test
  testNavigationPerformance: async (routes: string[], iterations: number = 5) => {
    const results: Array<{ route: string; time: number }> = [];
    
    for (let i = 0; i < iterations; i++) {
      for (const route of routes) {
        const start = performance.now();
        
        // Simulate navigation
        window.history.pushState({}, '', route);
        
        // Wait for next tick
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const end = performance.now();
        results.push({ route, time: end - start });
      }
    }
    
    console.table(results);
    return results;
  },

  // Render count tracker
  createRenderTracker: (componentName: string) => {
    let renderCount = 0;
    
    return {
      track: () => {
        renderCount++;
        console.log(`🔄 ${componentName} render #${renderCount}`);
      },
      getCount: () => renderCount,
      reset: () => { renderCount = 0; },
    };
  },
};
