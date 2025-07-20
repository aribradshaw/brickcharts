/**
 * BrickCharts - Billboard and Last.FM Charts Library
 * 
 * Copyright (c) 2024 Brickstone Studios LLC
 * Author: Ari Daniel Bradshaw
 * 
 * Licensed under the MIT License
 */

import { 
  ChartClient, 
  ChartData, 
  ChartSource, 
  FetchOptions, 
  DateRange, 
  HistoricalChartData,
  CacheOptions,
  ChartAnalytics
} from '../types';
import { BillboardClient } from '../clients/BillboardClient';
import { LastFMClient } from '../clients/LastFMClient';
import { ChartDataManager } from '../data/ChartDataManager';
import { generateChartAnalytics } from '../utils';

export interface BrickChartsConfig {
  enableCache?: boolean;
  cacheOptions?: CacheOptions;
  apiKeys?: {
    lastfm?: string;
    spotify?: string;
  };
  defaultSource?: ChartSource;
}

export class BrickCharts {
  private clients: Map<ChartSource, ChartClient> = new Map();
  private dataManager: ChartDataManager;
  private config: BrickChartsConfig;

  constructor(config: BrickChartsConfig = {}) {
    this.config = {
      enableCache: true,
      defaultSource: ChartSource.BILLBOARD,
      ...config
    };

    // Initialize data manager
    this.dataManager = new ChartDataManager(config.cacheOptions);

    // Initialize chart clients
    this.initializeClients();
  }

  /**
   * Initialize all available chart clients
   */
  private initializeClients(): void {
    // Always available: Billboard
    this.clients.set(ChartSource.BILLBOARD, new BillboardClient());

    // Optional: Last.FM (requires API key)
    if (this.config.apiKeys?.lastfm) {
      this.clients.set(ChartSource.LASTFM, new LastFMClient(this.config.apiKeys.lastfm));
    }
  }

  /**
   * Get a chart from the specified source
   */
  async getChart(
    chartType: string, 
    source: ChartSource = this.config.defaultSource!, 
    options: FetchOptions = {}
  ): Promise<ChartData> {
    const client = this.getClient(source);
    
    // Check cache first if enabled
    if (this.config.enableCache && options.useCache !== false && !options.forceRefresh) {
      const cached = await this.dataManager.getCachedChart(chartType, source, options.date);
      if (cached) {
        return cached;
      }
    }

    // Fetch from source
    const chartData = await client.getChart(chartType, options);
    
    // Cache the result if enabled
    if (this.config.enableCache) {
      await this.dataManager.cacheChart(chartData);
    }

    return chartData;
  }

  /**
   * Get historical chart data
   */
  async getHistoricalData(
    chartType: string,
    dateRange: DateRange,
    source: ChartSource = this.config.defaultSource!
  ): Promise<HistoricalChartData> {
    const client = this.getClient(source);
    return await client.getHistoricalData(chartType, dateRange);
  }

  /**
   * Get available charts from a source
   */
  async getAvailableCharts(source: ChartSource = this.config.defaultSource!): Promise<string[]> {
    const client = this.getClient(source);
    return await client.getAvailableCharts();
  }

  /**
   * Compare charts between different dates or sources
   */
  async compareCharts(
    chartType: string,
    date1: Date,
    date2: Date,
    source: ChartSource = this.config.defaultSource!
  ): Promise<ChartAnalytics> {
    const [currentChart, previousChart] = await Promise.all([
      this.getChart(chartType, source, { date: date2 }),
      this.getChart(chartType, source, { date: date1 })
    ]);

    return generateChartAnalytics(currentChart, previousChart);
  }

  /**
   * Get trending analysis for a chart
   */
  async getTrends(
    chartType: string,
    source: ChartSource = this.config.defaultSource!,
    weeksBack: number = 1
  ): Promise<ChartAnalytics> {
    const currentDate = new Date();
    const previousDate = new Date();
    previousDate.setDate(currentDate.getDate() - (weeksBack * 7));

    return await this.compareCharts(chartType, previousDate, currentDate, source);
  }

  /**
   * Search for a specific track across charts
   */
  async searchTrack(
    title: string,
    artist: string,
    chartType?: string,
    source: ChartSource = this.config.defaultSource!
  ): Promise<ChartData[]> {
    const client = this.getClient(source);
    const charts = chartType ? [chartType] : await client.getAvailableCharts();
    
    const results: ChartData[] = [];
    
    for (const chart of charts) {
      try {
        const chartData = await this.getChart(chart, source);
        const found = chartData.entries.find(entry => 
          entry.title.toLowerCase().includes(title.toLowerCase()) &&
          entry.artist.toLowerCase().includes(artist.toLowerCase())
        );
        
        if (found) {
          results.push(chartData);
        }
      } catch (error) {
        // Continue searching other charts
        console.warn(`Failed to search chart ${chart}: ${error}`);
      }
    }
    
    return results;
  }

  /**
   * Get chart data for multiple sources and merge
   */
  async getMultiSourceChart(
    chartType: string,
    sources: ChartSource[],
    options: FetchOptions = {}
  ): Promise<Map<ChartSource, ChartData>> {
    const results = new Map<ChartSource, ChartData>();
    
    const promises = sources.map(async (source) => {
      try {
        const chartData = await this.getChart(chartType, source, options);
        results.set(source, chartData);
      } catch (error) {
        console.warn(`Failed to fetch ${chartType} from ${source}: ${error}`);
      }
    });
    
    await Promise.all(promises);
    return results;
  }

  /**
   * Clear cache for specific chart or all
   */
  async clearCache(chartType?: string, source?: ChartSource): Promise<void> {
    await this.dataManager.clearCache(chartType, source);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    return await this.dataManager.getCacheStats();
  }

  /**
   * Add a custom chart client
   */
  addClient(source: ChartSource, client: ChartClient): void {
    this.clients.set(source, client);
  }

  /**
   * Remove a chart client
   */
  removeClient(source: ChartSource): void {
    this.clients.delete(source);
  }

  /**
   * Get available sources
   */
  getAvailableSources(): ChartSource[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BrickChartsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize clients if API keys changed
    if (newConfig.apiKeys) {
      this.initializeClients();
    }
  }

  /**
   * Get client for a specific source
   */
  private getClient(source: ChartSource): ChartClient {
    const client = this.clients.get(source);
    if (!client) {
      throw new Error(`No client available for source: ${source}`);
    }
    return client;
  }

  /**
   * Health check for all clients
   */
  async healthCheck(): Promise<Map<ChartSource, boolean>> {
    const health = new Map<ChartSource, boolean>();
    
    for (const [source, client] of this.clients) {
      try {
        await client.getAvailableCharts();
        health.set(source, true);
      } catch (error) {
        health.set(source, false);
      }
    }
    
    return health;
  }
} 