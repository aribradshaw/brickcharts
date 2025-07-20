import { ChartData, ChartEntry, TrendData, ChartAnalytics } from '../types';
import { ChartOptions } from 'chart.js';

export interface ChartTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  text: string;
  grid: string;
}

export interface ChartConfig {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: any;
  scales?: any;
  animation?: any;
  interaction?: any;
}

export interface BaseChartProps {
  width?: number;
  height?: number;
  theme?: Partial<ChartTheme>;
  config?: Partial<ChartConfig>;
  className?: string;
  onChartClick?: (entry: ChartEntry) => void;
  loading?: boolean;
  error?: Error | null;
}

export interface ChartComponentProps extends BaseChartProps {
  data: ChartData;
  showTrends?: boolean;
  showLabels?: boolean;
  timeRange?: 'week' | 'month' | 'year';
}

export interface ChartLineProps extends ChartComponentProps {
  showPoints?: boolean;
  smooth?: boolean;
  fillArea?: boolean;
}

export interface ChartBarProps extends ChartComponentProps {
  orientation?: 'horizontal' | 'vertical';
  stacked?: boolean;
  showValues?: boolean;
}

export interface ChartBubbleProps extends ChartComponentProps {
  xAxis: 'rank' | 'weeks' | 'peakPosition';
  yAxis: 'rank' | 'weeks' | 'peakPosition';
  sizeBy: 'weeks' | 'peakPosition' | 'fixed';
}

export interface ChartHeatmapProps extends BaseChartProps {
  data: ChartData[];
  xAxis: 'date' | 'week';
  yAxis: 'rank' | 'artist' | 'title';
  colorScale?: string[];
}

export interface ChartTimelineProps extends BaseChartProps {
  data: ChartData[];
  trackEntry?: ChartEntry;
  dateRange?: { start: Date; end: Date };
}

export interface TrendAnalyzerProps extends BaseChartProps {
  trends: TrendData[];
  chartType: string;
  comparisonMode?: 'week' | 'month';
}

export interface ChartComparisonProps extends BaseChartProps {
  data1: ChartData;
  data2: ChartData;
  comparisonType: 'rank' | 'entries' | 'artists';
  labels?: [string, string];
}

export interface ChartDashboardProps extends BaseChartProps {
  charts: ChartData[];
  analytics?: ChartAnalytics;
  layout?: 'grid' | 'tabs' | 'accordion';
  exportEnabled?: boolean;
}

export interface ChartControlsProps {
  chartType: string;
  availableCharts: string[];
  dateRange: { start: Date; end: Date };
  filters: ChartFilters;
  onChartTypeChange: (chartType: string) => void;
  onDateRangeChange: (dateRange: { start: Date; end: Date }) => void;
  onFiltersChange: (filters: ChartFilters) => void;
  onExport: (format: 'csv' | 'json' | 'png') => void;
}

export interface ChartFilters {
  artist?: string;
  genre?: string;
  minWeeks?: number;
  maxWeeks?: number;
  rankRange?: [number, number];
  newEntriesOnly?: boolean;
}

export interface ChartLegendProps {
  items: Array<{
    label: string;
    color: string;
    value?: string | number;
  }>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  interactive?: boolean;
}

export interface ExportButtonProps {
  data: ChartData | ChartData[];
  filename?: string;
  formats?: Array<'csv' | 'json' | 'png' | 'svg'>;
  onExport?: (format: string, success: boolean) => void;
}

export interface ChartEventHandlers {
  onEntryClick?: (entry: ChartEntry) => void;
  onEntryHover?: (entry: ChartEntry | null) => void;
  onRangeSelect?: (range: { start: Date; end: Date }) => void;
  onFilterChange?: (filters: ChartFilters) => void;
}

// Chart.js extended options
export interface ExtendedChartOptions extends ChartOptions {
  brickCharts?: {
    theme?: Partial<ChartTheme>;
    showTrends?: boolean;
    interactive?: boolean;
    exportable?: boolean;
  };
}

// Animation configurations
export interface ChartAnimations {
  duration?: number;
  easing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad';
  delay?: number;
  loop?: boolean;
}

// Export types
export type ExportFormat = 'csv' | 'json' | 'png' | 'svg' | 'pdf';
export type ChartType = 'line' | 'bar' | 'bubble' | 'heatmap' | 'timeline' | 'pie' | 'doughnut';
export type ThemeMode = 'light' | 'dark' | 'auto';

// Default themes
export const DEFAULT_LIGHT_THEME: ChartTheme = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#ffffff',
  text: '#374151',
  grid: '#e5e7eb'
};

export const DEFAULT_DARK_THEME: ChartTheme = {
  primary: '#60a5fa',
  secondary: '#9ca3af',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  background: '#1f2937',
  text: '#f3f4f6',
  grid: '#374151'
}; 