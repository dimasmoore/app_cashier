// Simple in-memory cache for API responses
// In production, consider using Redis or similar

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum number of entries

  set<T>(key: string, data: T, ttlMs: number = 300000): void { // Default 5 minutes
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton instance
export const cache = new MemoryCache();

// Cache key generators
export function generateSalesReportCacheKey(
  startDate: string,
  endDate: string,
  reportType: string
): string {
  return `sales:${reportType}:${startDate}:${endDate}`;
}

export function generateTransactionsCacheKey(
  startDate: string,
  endDate: string,
  page: number,
  limit: number,
  search?: string,
  paymentMethod?: string,
  status?: string
): string {
  const params = [
    `page:${page}`,
    `limit:${limit}`,
    search && `search:${search}`,
    paymentMethod && `payment:${paymentMethod}`,
    status && `status:${status}`,
  ].filter(Boolean).join(':');
  
  return `transactions:${startDate}:${endDate}:${params}`;
}

// Cache invalidation helpers
export function invalidateSalesCache(): void {
  const keys = cache.getStats().keys;
  keys.forEach(key => {
    if (key.startsWith('sales:')) {
      cache.delete(key);
    }
  });
}

export function invalidateTransactionsCache(): void {
  const keys = cache.getStats().keys;
  keys.forEach(key => {
    if (key.startsWith('transactions:')) {
      cache.delete(key);
    }
  });
}

export function invalidateAllReportsCache(): void {
  invalidateSalesCache();
  invalidateTransactionsCache();
}

// Cleanup expired entries every 10 minutes
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

// Cache configuration
export const CACHE_TTL = {
  SALES_REPORT: 5 * 60 * 1000, // 5 minutes
  TRANSACTIONS: 2 * 60 * 1000, // 2 minutes
  DASHBOARD_STATS: 1 * 60 * 1000, // 1 minute
} as const;
