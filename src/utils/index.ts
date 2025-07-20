import { ChartEntry, ChartData, TrendData, ChartAnalytics } from '../types';
import { format, parseISO, isValid, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Normalize chart data from different sources to a common format
 */
export function normalizeChartData(rawData: any, _source: string): ChartData {
  // Implementation depends on the source format
  // This is a placeholder that can be extended for different sources
  return rawData;
}

/**
 * Parse date string or Date object and ensure it's valid
 */
export function parseDate(date: string | Date): Date {
  if (date instanceof Date) {
    return isValid(date) ? date : new Date();
  }
  
  const parsed = parseISO(date);
  return isValid(parsed) ? parsed : new Date();
}

/**
 * Format date for display or API calls
 */
export function formatDate(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
  return format(date, formatStr);
}

/**
 * Calculate trends between two chart datasets
 */
export function calculateTrends(currentChart: ChartData, previousChart: ChartData): TrendData[] {
  const trends: TrendData[] = [];
  
  currentChart.entries.forEach(currentEntry => {
    const previousEntry = previousChart.entries.find(
      entry => entry.title === currentEntry.title && entry.artist === currentEntry.artist
    );
    
    let trend: 'up' | 'down' | 'stable' | 'new' = 'new';
    let positionChange = 0;
    
    if (previousEntry) {
      const change = previousEntry.rank - currentEntry.rank;
      positionChange = change;
      
      if (change > 0) {
        trend = 'up';
      } else if (change < 0) {
        trend = 'down';
      } else {
        trend = 'stable';
      }
    }
    
    trends.push({
      entry: currentEntry,
      trend,
      positionChange,
      weeklyData: [{
        date: currentEntry.chartDate,
        position: currentEntry.rank
      }]
    });
  });
  
  return trends;
}

/**
 * Generate analytics for chart data
 */
export function generateChartAnalytics(currentChart: ChartData, previousChart?: ChartData): ChartAnalytics {
  const analytics: ChartAnalytics = {
    totalEntries: currentChart.entries.length,
    newEntries: 0,
    droppedEntries: 0,
    trends: [],
    topMovers: {
      climbers: [],
      fallers: []
    }
  };
  
  if (!previousChart) {
    analytics.newEntries = currentChart.entries.length;
    return analytics;
  }
  
  // Calculate trends
  const trends = calculateTrends(currentChart, previousChart);
  analytics.trends = trends;
  
  // Count new and dropped entries
  analytics.newEntries = trends.filter(t => t.trend === 'new').length;
  analytics.droppedEntries = previousChart.entries.length - 
    (currentChart.entries.length - analytics.newEntries);
  
  // Find top movers
  const climbers = trends
    .filter(t => t.trend === 'up')
    .sort((a, b) => b.positionChange - a.positionChange)
    .slice(0, 10);
    
  const fallers = trends
    .filter(t => t.trend === 'down')
    .sort((a, b) => a.positionChange - b.positionChange)
    .slice(0, 10);
    
  analytics.topMovers = { climbers, fallers };
  
  return analytics;
}

/**
 * Filter chart entries by various criteria
 */
export function filterChartEntries(
  entries: ChartEntry[], 
  filters: {
    artist?: string;
    genre?: string;
    minWeeks?: number;
    maxWeeks?: number;
    peakPosition?: number;
  }
): ChartEntry[] {
  return entries.filter(entry => {
    if (filters.artist && !entry.artist.toLowerCase().includes(filters.artist.toLowerCase())) {
      return false;
    }
    
    if (filters.minWeeks && entry.weeksOnChart && entry.weeksOnChart < filters.minWeeks) {
      return false;
    }
    
    if (filters.maxWeeks && entry.weeksOnChart && entry.weeksOnChart > filters.maxWeeks) {
      return false;
    }
    
    if (filters.peakPosition && entry.peakPosition && entry.peakPosition > filters.peakPosition) {
      return false;
    }
    
    return true;
  });
}

/**
 * Sort chart entries by various criteria
 */
export function sortChartEntries(
  entries: ChartEntry[], 
  sortBy: 'rank' | 'title' | 'artist' | 'weeks' | 'peakPosition' = 'rank',
  order: 'asc' | 'desc' = 'asc'
): ChartEntry[] {
  return [...entries].sort((a, b) => {
    let aVal: any;
    let bVal: any;
    
    switch (sortBy) {
      case 'rank':
        aVal = a.rank;
        bVal = b.rank;
        break;
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'artist':
        aVal = a.artist.toLowerCase();
        bVal = b.artist.toLowerCase();
        break;
      case 'weeks':
        aVal = a.weeksOnChart || 0;
        bVal = b.weeksOnChart || 0;
        break;
      case 'peakPosition':
        aVal = a.peakPosition || 999;
        bVal = b.peakPosition || 999;
        break;
      default:
        aVal = a.rank;
        bVal = b.rank;
    }
    
    if (order === 'desc') {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    } else {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    }
  });
}

/**
 * Get week start and end dates for chart periods
 */
export function getChartWeek(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday start
    end: endOfWeek(date, { weekStartsOn: 1 })
  };
}

/**
 * Debounce function for rate limiting API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a hash of chart entry for comparison
 */
export function createEntryHash(entry: ChartEntry): string {
  return `${entry.title}-${entry.artist}`.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Validate chart data structure
 */
export function validateChartData(data: any): data is ChartData {
  return (
    data &&
    typeof data.chartType === 'string' &&
    data.date instanceof Date &&
    Array.isArray(data.entries) &&
    typeof data.totalEntries === 'number' &&
    data.entries.every((entry: any) => 
      typeof entry.rank === 'number' &&
      typeof entry.title === 'string' &&
      typeof entry.artist === 'string'
    )
  );
} 