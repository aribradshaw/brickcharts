import { ChartData, TrendData, ChartAnalytics } from '../types';
import { formatDate } from '../utils';

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'png' | 'svg' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeMetadata?: boolean;
  dateFormat?: string;
  compression?: boolean;
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
    backgroundColor?: string;
  };
}

export interface ExportResult {
  success: boolean;
  data?: any;
  blob?: Blob;
  url?: string;
  filename: string;
  size?: number;
  error?: string;
}

export class ExportManager {
  /**
   * Export chart data in specified format
   */
  async exportChartData(
    data: ChartData | ChartData[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const filename = options.filename || this.generateFilename(data, options.format);
      
      switch (options.format) {
        case 'csv':
          return await this.exportToCsv(data, filename, options);
        case 'json':
          return await this.exportToJson(data, filename, options);
        case 'xlsx':
          return await this.exportToExcel(data, filename, options);
        case 'png':
        case 'svg':
          return await this.exportToImage(data, filename, options);
        case 'pdf':
          return await this.exportToPdf(data, filename, options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        filename: options.filename || 'export',
        error: error instanceof Error ? error.message : 'Unknown export error'
      };
    }
  }

  /**
   * Export trends data
   */
  async exportTrends(
    trends: TrendData[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const chartData: ChartData = {
      chartType: 'trends',
      date: new Date(),
      entries: trends.map(t => t.entry),
      source: trends[0]?.entry.source || 'unknown' as any,
      totalEntries: trends.length,
      metadata: {
        exportType: 'trends',
        trendsData: trends.map(t => ({
          trend: t.trend,
          positionChange: t.positionChange
        }))
      }
    };

    return await this.exportChartData(chartData, options);
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    analytics: ChartAnalytics,
    options: ExportOptions
  ): Promise<ExportResult> {
    if (options.format === 'json') {
      const jsonData = JSON.stringify(analytics, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      return {
        success: true,
        data: analytics,
        blob,
        url,
        filename: options.filename || 'analytics.json',
        size: blob.size
      };
    }

    // Convert analytics to chart-like format for other exports
    const chartData: ChartData = {
      chartType: 'analytics',
      date: new Date(),
      entries: analytics.trends.map(t => t.entry),
      source: 'analytics' as any,
      totalEntries: analytics.totalEntries,
      metadata: {
        exportType: 'analytics',
        analytics
      }
    };

    return await this.exportChartData(chartData, options);
  }

  /**
   * Generate automatic filename
   */
  private generateFilename(data: ChartData | ChartData[], format: ExportFormat): string {
    const timestamp = formatDate(new Date(), 'yyyy-MM-dd');
    
    if (Array.isArray(data)) {
      const chartTypes = [...new Set(data.map(d => d.chartType))];
      const chartName = chartTypes.length === 1 ? chartTypes[0] : 'multiple-charts';
      return `${chartName}-${timestamp}.${format}`;
    } else {
      return `${data.chartType}-${timestamp}.${format}`;
    }
  }

  /**
   * Export to CSV format
   */
  private async exportToCsv(
    data: ChartData | ChartData[],
    filename: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const charts = Array.isArray(data) ? data : [data];
    const rows: string[] = [];
    
    // Headers
    const headers = [
      'Chart Type',
      'Date',
      'Rank',
      'Title',
      'Artist',
      'Album',
      'Last Week',
      'Peak Position',
      'Weeks on Chart',
      'Source'
    ];
    
    if (options.includeMetadata) {
      headers.push('Cover URL', 'Metadata');
    }
    
    rows.push(headers.join(','));

    // Data rows
    charts.forEach(chart => {
      chart.entries.forEach(entry => {
        const row = [
          this.escapeCsvValue(chart.chartType),
          this.escapeCsvValue(formatDate(chart.date, options.dateFormat || 'yyyy-MM-dd')),
          entry.rank.toString(),
          this.escapeCsvValue(entry.title),
          this.escapeCsvValue(entry.artist),
          this.escapeCsvValue(entry.album || ''),
          entry.lastWeek?.toString() || '',
          entry.peakPosition?.toString() || '',
          entry.weeksOnChart?.toString() || '',
          this.escapeCsvValue(entry.source)
        ];

        if (options.includeMetadata) {
          row.push(
            this.escapeCsvValue(entry.metadata?.cover || ''),
            this.escapeCsvValue(JSON.stringify(entry.metadata || {}))
          );
        }

        rows.push(row.join(','));
      });
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    return {
      success: true,
      data: csvContent,
      blob,
      url,
      filename,
      size: blob.size
    };
  }

  /**
   * Export to JSON format
   */
  private async exportToJson(
    data: ChartData | ChartData[],
    filename: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const exportData = {
      exportDate: new Date().toISOString(),
      format: 'json',
      data: Array.isArray(data) ? data : [data],
      metadata: options.includeMetadata ? {
        totalCharts: Array.isArray(data) ? data.length : 1,
        totalEntries: Array.isArray(data) 
          ? data.reduce((sum, chart) => sum + chart.entries.length, 0)
          : data.entries.length,
        sources: Array.isArray(data)
          ? [...new Set(data.map(d => d.source))]
          : [data.source],
        chartTypes: Array.isArray(data)
          ? [...new Set(data.map(d => d.chartType))]
          : [data.chartType]
      } : undefined
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    return {
      success: true,
      data: exportData,
      blob,
      url,
      filename,
      size: blob.size
    };
  }

  /**
   * Export to Excel format (placeholder)
   */
  private async exportToExcel(
    data: ChartData | ChartData[],
    filename: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    // This would require a library like 'xlsx' or 'exceljs'
    // For now, export as CSV and suggest user can import into Excel
    const csvResult = await this.exportToCsv(data, filename.replace('.xlsx', '.csv'), options);
    
    return {
      ...csvResult,
      filename: filename.replace('.xlsx', '.csv'),
      error: csvResult.success ? 'Exported as CSV (Excel compatible)' : csvResult.error
    };
  }

  /**
   * Export to image format (PNG/SVG)
   */
  private async exportToImage(
    data: ChartData | ChartData[],
    filename: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    // This would require chart rendering and html2canvas or similar
    // For now, return a placeholder implementation
    
    const imageOptions = options.imageOptions || {};
    const width = imageOptions.width || 800;
    const height = imageOptions.height || 600;
    
    // Create a simple SVG representation
    const svg = this.generateSvgChart(data, width, height);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    return {
      success: true,
      data: svg,
      blob,
      url,
      filename,
      size: blob.size
    };
  }

  /**
   * Export to PDF format (placeholder)
   */
  private async exportToPdf(
    _data: ChartData | ChartData[],
    filename: string,
    _options: ExportOptions
  ): Promise<ExportResult> {
    // This would require a library like 'jspdf' or 'puppeteer'
    // For now, return error suggesting alternative formats
    
    return {
      success: false,
      filename,
      error: 'PDF export not yet implemented. Try CSV or JSON formats.'
    };
  }

  /**
   * Generate a simple SVG chart representation
   */
  private generateSvgChart(data: ChartData | ChartData[], width: number, height: number): string {
    const chart = Array.isArray(data) ? data[0] : data;
    const entries = chart.entries.slice(0, 20); // Top 20
    
    const barWidth = (width - 100) / entries.length;
    const maxRank = Math.max(...entries.map(e => e.rank));
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${width}" height="${height}" fill="white"/>`;
    svg += `<text x="10" y="30" font-family="Arial" font-size="20" font-weight="bold">${chart.chartType}</text>`;
    svg += `<text x="10" y="50" font-family="Arial" font-size="14" fill="gray">${formatDate(chart.date)}</text>`;
    
    entries.forEach((entry, index) => {
      const x = 50 + index * barWidth;
      const barHeight = (height - 150) * (1 - (entry.rank / maxRank));
      const y = height - 100 - barHeight;
      
      svg += `<rect x="${x}" y="${y}" width="${barWidth - 2}" height="${barHeight}" fill="hsl(${index * 20}, 70%, 50%)" opacity="0.8"/>`;
      svg += `<text x="${x + barWidth/2}" y="${height - 80}" font-family="Arial" font-size="10" text-anchor="middle">#${entry.rank}</text>`;
      svg += `<text x="${x + barWidth/2}" y="${height - 65}" font-family="Arial" font-size="8" text-anchor="middle">${entry.title.slice(0, 15)}...</text>`;
    });
    
    svg += '</svg>';
    return svg;
  }

  /**
   * Escape CSV values
   */
  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Download helper for browser environments
   */
  static downloadBlob(blob: Blob, filename: string): void {
    if (typeof window !== 'undefined') {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Get supported formats
   */
  static getSupportedFormats(): ExportFormat[] {
    return ['csv', 'json', 'xlsx', 'png', 'svg'];
  }

  /**
   * Validate export options
   */
  static validateOptions(options: ExportOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.getSupportedFormats().includes(options.format)) {
      errors.push(`Unsupported format: ${options.format}`);
    }
    
    if (options.filename && !/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(options.filename)) {
      errors.push('Invalid filename format');
    }
    
    if (options.imageOptions?.width && options.imageOptions.width < 100) {
      errors.push('Image width must be at least 100px');
    }
    
    if (options.imageOptions?.height && options.imageOptions.height < 100) {
      errors.push('Image height must be at least 100px');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 