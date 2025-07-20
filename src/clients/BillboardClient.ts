const { getChart, listCharts } = require('@aribradshaw/billboard-top-100');
import { 
  ChartClient, 
  ChartData, 
  ChartEntry, 
  ChartSource, 
  FetchOptions, 
  DateRange, 
  HistoricalChartData,
  APIError
} from '../types';

export class BillboardClient implements ChartClient {
  public readonly name = 'Billboard';
  public readonly source = ChartSource.BILLBOARD;

  private readonly chartMap = new Map<string, string>([
    ['hot-100', 'hot-100'],
    ['billboard-200', 'billboard-200'],
    ['artist-100', 'artist-100'],
    ['pop-songs', 'pop-songs'],
    ['country-songs', 'country-songs'],
    ['rock-songs', 'rock-songs'],
    ['r-b-songs', 'r-b-songs'],
    ['rap-songs', 'rap-songs'],
    ['dance-songs', 'dance-songs'],
    ['latin-songs', 'latin-songs']
  ]);

  /**
   * Get available Billboard chart types
   */
  async getAvailableCharts(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      listCharts((err: any, charts: any) => {
        if (err) {
          reject(new APIError(
            `Failed to fetch available charts: ${err}`,
            500,
            ChartSource.BILLBOARD
          ));
        } else {
          // Handle chart name extraction - charts might be objects or strings
          const chartNames = charts.map((chart: any) => {
            if (typeof chart === 'string') {
              return chart;
            } else if (chart && chart.chart) {
              return chart.chart;
            } else if (chart && chart.name) {
              return chart.name;
            } else {
              return String(chart);
            }
          });
          resolve(chartNames);
        }
      });
    });
  }

  /**
   * Fetch a specific Billboard chart
   */
  async getChart(type: string, options: FetchOptions = {}): Promise<ChartData> {
    return new Promise((resolve, reject) => {
      const chartType = this.chartMap.get(type) || type;
      const date = options.date ? this.formatDateForAPI(options.date) : undefined;
      
      if (date) {
        getChart(chartType, date, (err: any, chart: any) => {
          if (err) {
            reject(new APIError(
              `Failed to fetch Billboard chart ${type}: ${err}`,
              500,
              ChartSource.BILLBOARD
            ));
          } else {
            resolve(this.normalizeBillboardData(chart, type, options.date || new Date()));
          }
        });
      } else {
        getChart(chartType, (err: any, chart: any) => {
          if (err) {
            reject(new APIError(
              `Failed to fetch Billboard chart ${type}: ${err}`,
              500,
              ChartSource.BILLBOARD
            ));
          } else {
            resolve(this.normalizeBillboardData(chart, type, new Date()));
          }
        });
      }
    });
  }

  /**
   * Get historical data for a chart over a date range
   */
  async getHistoricalData(type: string, dateRange: DateRange): Promise<HistoricalChartData> {
    const data: ChartData[] = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    // Generate weekly dates between start and end
    const dates = this.generateWeeklyDates(startDate, endDate);
    
    try {
      // Fetch charts for each date (with some delay to respect rate limits)
      for (const date of dates) {
        try {
          const chartData = await this.getChart(type, { date });
          data.push(chartData);
          
          // Small delay to avoid hitting rate limits
          await this.delay(100);
        } catch (error) {
          console.warn(`Failed to fetch chart for ${date}: ${error}`);
          // Continue with other dates
        }
      }

      return {
        chartType: type,
        dateRange,
        data,
        source: ChartSource.BILLBOARD
      };
    } catch (error) {
      throw new APIError(
        `Failed to fetch historical data for ${type}: ${error}`,
        500,
        ChartSource.BILLBOARD
      );
    }
  }

  /**
   * Normalize Billboard API response to our standard format
   */
  private normalizeBillboardData(billboardData: any, chartType: string, date: Date): ChartData {
    const entries: ChartEntry[] = [];
    
    // Handle different chart types (songs vs albums)
    const rawEntries = billboardData.songs || billboardData.albums || [];
    
    rawEntries.forEach((entry: any, index: number) => {
      entries.push({
        rank: entry.rank || (index + 1),
        title: entry.title,
        artist: entry.artist,
        lastWeek: entry.position?.positionLastWeek > 0 ? entry.position.positionLastWeek : undefined,
        peakPosition: entry.position?.peakPosition,
        weeksOnChart: entry.position?.weeksOnChart,
        chartDate: date,
        source: ChartSource.BILLBOARD,
        metadata: {
          originalData: entry,
          cover: entry.cover
        }
      });
    });

    return {
      chartType,
      date,
      entries,
      source: ChartSource.BILLBOARD,
      totalEntries: entries.length,
      metadata: {
        week: billboardData.week,
        previousWeek: billboardData.previousWeek,
        nextWeek: billboardData.nextWeek
      }
    };
  }

  /**
   * Format date for Billboard API (YYYY-MM-DD)
   */
  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate weekly dates between start and end date
   */
  private generateWeeklyDates(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7); // Add 7 days for weekly charts
    }
    
    return dates;
  }

  /**
   * Simple delay utility for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get chart metadata and information
   */
  async getChartInfo(type: string): Promise<any> {
    try {
      const charts = await this.getAvailableCharts();
      return charts.find(chart => chart === type) ? { name: type, available: true } : null;
    } catch (error) {
      throw new APIError(
        `Failed to get chart info for ${type}: ${error}`,
        500,
        ChartSource.BILLBOARD
      );
    }
  }
} 