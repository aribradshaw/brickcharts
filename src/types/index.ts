// Core chart data types
export interface ChartEntry {
  rank: number;
  title: string;
  artist: string;
  album?: string;
  label?: string;
  lastWeek?: number;
  peakPosition?: number;
  weeksOnChart?: number;
  chartDate: Date;
  source: ChartSource;
  metadata?: Record<string, any>;
}

export interface ChartData {
  chartType: string;
  date: Date;
  entries: ChartEntry[];
  source: ChartSource;
  totalEntries: number;
  metadata?: Record<string, any>;
}

export interface HistoricalChartData {
  chartType: string;
  dateRange: DateRange;
  data: ChartData[];
  source: ChartSource;
}

// Chart sources
export enum ChartSource {
  BILLBOARD = 'billboard',
  LASTFM = 'lastfm',
  CUSTOM = 'custom'
}

// Billboard specific types
export interface BillboardChartType {
  name: string;
  id: string;
  category: 'songs' | 'albums' | 'artists';
}

export interface BillboardEntry {
  rank: number;
  title: string;
  artist: string;
  weeks: number;
  lastWeek: number;
  peakPosition: number;
  chartDate: string;
}

export interface BillboardChart {
  chart: string;
  date: string;
  songs?: BillboardEntry[];
  albums?: BillboardEntry[];
}

// Last.FM specific types
export interface LastFMTrack {
  name: string;
  artist: {
    name: string;
    mbid?: string;
  };
  playcount: string;
  listeners: string;
  rank: string;
  '@attr'?: {
    rank: string;
  };
}

export interface LastFMChart {
  track?: LastFMTrack[];
  '@attr': {
    from: string;
    to: string;
    page: string;
    perPage: string;
    total: string;
    totalPages: string;
  };
}

// Data management types
export interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  persistent: boolean; // Whether to persist to localStorage
}

export interface FetchOptions {
  date?: Date;
  limit?: number;
  offset?: number;
  useCache?: boolean;
  forceRefresh?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// API client interfaces
export interface ChartClient {
  name: string;
  source: ChartSource;
  getChart(type: string, options?: FetchOptions): Promise<ChartData>;
  getAvailableCharts(): Promise<string[]>;
  getHistoricalData(type: string, dateRange: DateRange): Promise<HistoricalChartData>;
}

// Trend analysis types
export interface TrendData {
  entry: ChartEntry;
  trend: 'up' | 'down' | 'stable' | 'new';
  positionChange: number;
  weeklyData: Array<{
    date: Date;
    position: number;
  }>;
}

export interface ChartAnalytics {
  totalEntries: number;
  newEntries: number;
  droppedEntries: number;
  trends: TrendData[];
  topMovers: {
    climbers: TrendData[];
    fallers: TrendData[];
  };
}

// Visualization types
export interface ChartVisualizationConfig {
  type: 'line' | 'bar' | 'bubble' | 'heatmap' | 'timeline';
  width?: number;
  height?: number;
  responsive?: boolean;
  theme?: 'light' | 'dark' | 'custom';
  colors?: string[];
  animations?: boolean;
  interactive?: boolean;
}

// Error types
export class BrickChartsError extends Error {
  constructor(
    message: string,
    public code: string,
    public source?: ChartSource
  ) {
    super(message);
    this.name = 'BrickChartsError';
  }
}

export class APIError extends BrickChartsError {
  constructor(
    message: string,
    public statusCode: number,
    source: ChartSource
  ) {
    super(message, 'API_ERROR', source);
    this.name = 'APIError';
  }
}

export class CacheError extends BrickChartsError {
  constructor(message: string) {
    super(message, 'CACHE_ERROR');
    this.name = 'CacheError';
  }
} 