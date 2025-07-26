


interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; 
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; 

  set<T>(key: string, data: T, ttlMs: number = 300000): void { 
    
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

  
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}


export const cache = new MemoryCache();


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


if (typeof window === 'undefined') { 
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}


export const CACHE_TTL = {
  SALES_REPORT: 5 * 60 * 1000, 
  TRANSACTIONS: 2 * 60 * 1000, 
  DASHBOARD_STATS: 1 * 60 * 1000, 
} as const;
