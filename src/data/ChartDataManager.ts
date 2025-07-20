import { ChartData, ChartSource, CacheOptions, CacheError } from '../types';
import { ChartCache } from './ChartCache';

export class ChartDataManager {
  private cache: ChartCache;
  
  constructor(options?: CacheOptions) {
    this.cache = new ChartCache(options);
  }

  /**
   * Cache chart data
   */
  async cacheChart(chartData: ChartData): Promise<void> {
    try {
      await this.cache.set(this.generateCacheKey(chartData), chartData);
    } catch (error) {
      throw new CacheError(`Failed to cache chart data: ${error}`);
    }
  }

  /**
   * Get cached chart data
   */
  async getCachedChart(
    chartType: string, 
    source: ChartSource, 
    date?: Date
  ): Promise<ChartData | null> {
    try {
      const key = this.generateCacheKey({
        chartType,
        source,
        date: date || new Date()
      } as ChartData);
      
      return await this.cache.get(key);
    } catch (error) {
      console.warn(`Failed to get cached chart: ${error}`);
      return null;
    }
  }

  /**
   * Clear cache
   */
  async clearCache(chartType?: string, source?: ChartSource): Promise<void> {
    try {
      if (chartType && source) {
        const pattern = `${source}-${chartType}-`;
        await this.cache.clearByPattern(pattern);
      } else {
        await this.cache.clear();
      }
    } catch (error) {
      throw new CacheError(`Failed to clear cache: ${error}`);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    return await this.cache.getStats();
  }

  /**
   * Generate cache key for chart data
   */
  private generateCacheKey(chartData: Pick<ChartData, 'chartType' | 'source' | 'date'>): string {
    const dateStr = chartData.date.toISOString().split('T')[0];
    return `${chartData.source}-${chartData.chartType}-${dateStr}`;
  }
} 