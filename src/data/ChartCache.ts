import { ChartData, CacheOptions, CacheError } from '../types';

interface CacheItem {
  data: ChartData;
  timestamp: number;
  ttl: number;
}

export class ChartCache {
  private memoryCache = new Map<string, CacheItem>();
  private options: Required<CacheOptions>;

  constructor(options?: CacheOptions) {
    this.options = {
      ttl: 1000 * 60 * 60, // 1 hour default
      maxSize: 100,
      persistent: true,
      ...options
    };

    if (this.options.persistent) {
      this.loadFromStorage();
    }
  }

  /**
   * Set cache item
   */
  async set(key: string, data: ChartData): Promise<void> {
    try {
      const item: CacheItem = {
        data,
        timestamp: Date.now(),
        ttl: this.options.ttl
      };

      // Check cache size limit
      if (this.memoryCache.size >= this.options.maxSize) {
        this.evictOldest();
      }

      this.memoryCache.set(key, item);

      if (this.options.persistent) {
        await this.saveToStorage(key, item);
      }
    } catch (error) {
      throw new CacheError(`Failed to set cache item: ${error}`);
    }
  }

  /**
   * Get cache item
   */
  async get(key: string): Promise<ChartData | null> {
    try {
      let item = this.memoryCache.get(key);

      // If not in memory but persistent, try loading from storage
      if (!item && this.options.persistent) {
        const loadedItem = await this.loadFromStorage(key);
        if (loadedItem) {
          this.memoryCache.set(key, loadedItem);
          item = loadedItem;
        }
      }

      if (!item) {
        return null;
      }

      // Check if expired
      if (this.isExpired(item)) {
        await this.delete(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn(`Failed to get cache item: ${error}`);
      return null;
    }
  }

  /**
   * Delete cache item
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);

    if (this.options.persistent && typeof localStorage !== 'undefined') {
      localStorage.removeItem(`brickcharts-${key}`);
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearByPattern(pattern: string): Promise<void> {
    const keysToDelete: string[] = [];

    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();

    if (this.options.persistent && typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('brickcharts-')
      );
      
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    let expired = 0;
    let valid = 0;

    for (const item of this.memoryCache.values()) {
      if (this.isExpired(item)) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      totalItems: this.memoryCache.size,
      validItems: valid,
      expiredItems: expired,
      maxSize: this.options.maxSize,
      persistent: this.options.persistent,
      ttl: this.options.ttl
    };
  }

  /**
   * Check if cache item is expired
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Evict oldest cache item
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.memoryCache) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * Save to localStorage
   */
  private async saveToStorage(key: string, item: CacheItem): Promise<void> {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(`brickcharts-${key}`, JSON.stringify({
        ...item,
        data: {
          ...item.data,
          date: item.data.date.toISOString() // Serialize date
        }
      }));
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${error}`);
    }
  }

  /**
   * Load from localStorage
   */
  private async loadFromStorage(key?: string): Promise<CacheItem | null> {
    if (typeof localStorage === 'undefined') return null;

    try {
      if (key) {
        const stored = localStorage.getItem(`brickcharts-${key}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            data: {
              ...parsed.data,
              date: new Date(parsed.data.date) // Deserialize date
            }
          };
        }
        return null;
      } else {
        // Load all items
        const keys = Object.keys(localStorage).filter(k => k.startsWith('brickcharts-'));
        for (const storageKey of keys) {
          const key = storageKey.replace('brickcharts-', '');
          const item = await this.loadFromStorage(key);
          if (item && !this.isExpired(item)) {
            this.memoryCache.set(key, item);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to load from localStorage: ${error}`);
    }

    return null;
  }
} 