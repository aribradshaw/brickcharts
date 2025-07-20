import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrickCharts, ChartSource } from '../src';
import { SearchEngine } from '../src/search/SearchEngine';
import { ExportManager } from '../src/export/ExportManager';

// Mock the billboard-top-100 module
vi.mock('billboard-top-100', () => ({
  default: {
    getChart: vi.fn(),
    listCharts: vi.fn()
  },
  getChart: vi.fn(),
  listCharts: vi.fn()
}));

const { getChart, listCharts } = require('billboard-top-100');

describe('BrickCharts Core', () => {
  let brickCharts: BrickCharts;

  beforeEach(() => {
    brickCharts = new BrickCharts({
      enableCache: false, // Disable cache for testing
      defaultSource: ChartSource.BILLBOARD
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const instance = new BrickCharts();
      expect(instance).toBeDefined();
      expect(instance.getAvailableSources()).toContain(ChartSource.BILLBOARD);
    });

    it('should initialize with custom configuration', () => {
      const config = {
        enableCache: true,
        defaultSource: ChartSource.BILLBOARD,
        cacheOptions: {
          ttl: 60000,
          maxSize: 100,
          persistent: true
        }
      };

      const instance = new BrickCharts(config);
      expect(instance).toBeDefined();
    });
  });

  describe('Chart Fetching', () => {
    it('should fetch Hot 100 chart successfully', async () => {
      const mockChartData = {
        songs: [
          {
            rank: 1,
            title: 'Test Song',
            artist: 'Test Artist',
            position: {
              positionLastWeek: 2,
              peakPosition: 1,
              weeksOnChart: 5
            }
          }
        ],
        week: '2024-01-01'
      };

      getChart.mockImplementation((chartType: string, date: string, callback: Function) => {
        callback(null, mockChartData);
      });

      const chart = await brickCharts.getChart('hot-100');

      expect(chart).toBeDefined();
      expect(chart.entries).toHaveLength(1);
      expect(chart.entries[0].title).toBe('Test Song');
      expect(chart.entries[0].rank).toBe(1);
      expect(chart.source).toBe(ChartSource.BILLBOARD);
    });

    it('should handle chart fetching errors', async () => {
      getChart.mockImplementation((chartType: string, date: string, callback: Function) => {
        callback(new Error('API Error'), null);
      });

      await expect(brickCharts.getChart('hot-100')).rejects.toThrow();
    });

    it('should fetch chart with specific date', async () => {
      const mockChartData = {
        songs: [{ rank: 1, title: 'Test', artist: 'Artist', position: {} }],
        week: '2023-01-01'
      };

      getChart.mockImplementation((chartType: string, date: string, callback: Function) => {
        expect(date).toBe('2023-01-01');
        callback(null, mockChartData);
      });

      await brickCharts.getChart('hot-100', ChartSource.BILLBOARD, {
        date: new Date('2023-01-01')
      });
    });
  });

  describe('Available Charts', () => {
    it('should fetch available charts', async () => {
      const mockCharts = ['Billboard Hot 100™', 'Billboard 200™', 'Artist 100'];

      listCharts.mockImplementation((callback: Function) => {
        callback(null, mockCharts);
      });

      const charts = await brickCharts.getAvailableCharts();

      expect(charts).toEqual(mockCharts);
      expect(listCharts).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle errors when fetching available charts', async () => {
      listCharts.mockImplementation((callback: Function) => {
        callback(new Error('Network error'), null);
      });

      await expect(brickCharts.getAvailableCharts()).rejects.toThrow();
    });
  });

  describe('Health Check', () => {
    it('should perform health check on all sources', async () => {
      listCharts.mockImplementation((callback: Function) => {
        callback(null, ['hot-100']);
      });

      const health = await brickCharts.healthCheck();

      expect(health).toBeInstanceOf(Map);
      expect(health.has(ChartSource.BILLBOARD)).toBe(true);
    });

    it('should detect unhealthy sources', async () => {
      listCharts.mockImplementation((callback: Function) => {
        callback(new Error('Service down'), null);
      });

      const health = await brickCharts.healthCheck();

      expect(health.get(ChartSource.BILLBOARD)).toBe(false);
    });
  });
});

describe('Search Engine', () => {
  let searchEngine: SearchEngine;
  let mockChartData: any;

  beforeEach(() => {
    searchEngine = new SearchEngine();
    
    mockChartData = [
      {
        chartType: 'hot-100',
        date: new Date('2024-01-01'),
        source: ChartSource.BILLBOARD,
        totalEntries: 3,
        entries: [
          {
            rank: 1,
            title: 'Love Story',
            artist: 'Taylor Swift',
            chartDate: new Date('2024-01-01'),
            source: ChartSource.BILLBOARD
          },
          {
            rank: 2,
            title: 'Blank Space',
            artist: 'Taylor Swift',
            chartDate: new Date('2024-01-01'),
            source: ChartSource.BILLBOARD
          },
          {
            rank: 3,
            title: 'God\'s Plan',
            artist: 'Drake',
            chartDate: new Date('2024-01-01'),
            source: ChartSource.BILLBOARD
          }
        ]
      }
    ];

    searchEngine.indexChartData(mockChartData);
  });

  describe('Basic Search', () => {
    it('should find exact artist matches', () => {
      const { results } = searchEngine.search({ artist: 'Taylor Swift' });
      
      expect(results).toHaveLength(2);
      expect(results[0].entry.artist).toBe('Taylor Swift');
      expect(results[1].entry.artist).toBe('Taylor Swift');
    });

    it('should find partial title matches', () => {
      const { results } = searchEngine.search({ title: 'Love' });
      
      expect(results).toHaveLength(1);
      expect(results[0].entry.title).toBe('Love Story');
    });

    it('should perform fuzzy search', () => {
      const { results } = searchEngine.search({ 
        artist: 'Tayler Swift', 
        fuzzy: true 
      });
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].matches[0].matchType).toBe('fuzzy');
    });
  });

  describe('Advanced Search', () => {
    it('should filter by rank range', () => {
      const { results } = searchEngine.search({
        rankRange: { min: 1, max: 2 }
      });
      
      expect(results).toHaveLength(2);
      expect(results.every(r => r.entry.rank <= 2)).toBe(true);
    });

    it('should apply search limits', () => {
      const { results } = searchEngine.search({
        artist: 'Taylor Swift',
        limit: 1
      });
      
      expect(results).toHaveLength(1);
    });
  });

  describe('Quick Search', () => {
    it('should provide autocomplete suggestions', () => {
      const suggestions = searchEngine.quickSearch('Tay', 'artist');
      
      expect(suggestions).toContain('Taylor Swift');
    });

    it('should limit suggestion count', () => {
      const suggestions = searchEngine.quickSearch('a', 'artist', 2);
      
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Similar Tracks', () => {
    it('should find similar tracks by artist', () => {
      const entry = mockChartData[0].entries[0]; // Love Story - Taylor Swift
      const similar = searchEngine.findSimilar(entry);
      
      expect(similar.length).toBeGreaterThan(0);
      expect(similar[0].entry.artist).toBe('Taylor Swift');
      expect(similar[0].entry.title).not.toBe('Love Story');
    });
  });
});

describe('Export Manager', () => {
  let exportManager: ExportManager;
  let mockChartData: any;

  beforeEach(() => {
    exportManager = new ExportManager();
    
    mockChartData = {
      chartType: 'hot-100',
      date: new Date('2024-01-01'),
      source: ChartSource.BILLBOARD,
      totalEntries: 2,
      entries: [
        {
          rank: 1,
          title: 'Test Song 1',
          artist: 'Test Artist 1',
          chartDate: new Date('2024-01-01'),
          source: ChartSource.BILLBOARD
        },
        {
          rank: 2,
          title: 'Test Song 2',
          artist: 'Test Artist 2',
          chartDate: new Date('2024-01-01'),
          source: ChartSource.BILLBOARD
        }
      ]
    };
  });

  describe('CSV Export', () => {
    it('should export chart data to CSV format', async () => {
      const result = await exportManager.exportChartData(mockChartData, {
        format: 'csv'
      });

      expect(result.success).toBe(true);
      expect(result.data).toContain('Chart Type,Date,Rank,Title,Artist');
      expect(result.data).toContain('Test Song 1,Test Artist 1');
      expect(result.blob).toBeInstanceOf(Blob);
    });

    it('should include metadata in CSV export when requested', async () => {
      const result = await exportManager.exportChartData(mockChartData, {
        format: 'csv',
        includeMetadata: true
      });

      expect(result.success).toBe(true);
      expect(result.data).toContain('Cover URL,Metadata');
    });
  });

  describe('JSON Export', () => {
    it('should export chart data to JSON format', async () => {
      const result = await exportManager.exportChartData(mockChartData, {
        format: 'json'
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('data');
      expect(result.data.data[0].chartType).toBe('hot-100');
      expect(result.blob).toBeInstanceOf(Blob);
    });
  });

  describe('SVG Export', () => {
    it('should export chart data to SVG format', async () => {
      const result = await exportManager.exportChartData(mockChartData, {
        format: 'svg',
        imageOptions: { width: 800, height: 600 }
      });

      expect(result.success).toBe(true);
      expect(result.data).toContain('<svg');
      expect(result.data).toContain('hot-100');
    });
  });

  describe('Export Validation', () => {
    it('should validate export options', () => {
      const validation = ExportManager.validateOptions({
        format: 'csv',
        filename: 'test.csv'
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid formats', () => {
      const validation = ExportManager.validateOptions({
        format: 'invalid' as any
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Unsupported format: invalid');
    });

    it('should reject invalid image dimensions', () => {
      const validation = ExportManager.validateOptions({
        format: 'png',
        imageOptions: { width: 50, height: 50 }
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Integration Tests', () => {
  let brickCharts: BrickCharts;

  beforeEach(() => {
    brickCharts = new BrickCharts({ enableCache: false });
  });

  describe('Chart Fetching and Search Integration', () => {
    it('should fetch chart and search within it', async () => {
      const mockChartData = {
        songs: [
          {
            rank: 1,
            title: 'Love Story',
            artist: 'Taylor Swift',
            position: { positionLastWeek: 2, peakPosition: 1, weeksOnChart: 5 }
          }
        ],
        week: '2024-01-01'
      };

      getChart.mockImplementation((chartType: string, date: string, callback: Function) => {
        callback(null, mockChartData);
      });

      const chart = await brickCharts.getChart('hot-100');
      
      const searchEngine = new SearchEngine();
      searchEngine.indexChartData([chart]);
      
      const { results } = searchEngine.search({ artist: 'Taylor Swift' });
      
      expect(results).toHaveLength(1);
      expect(results[0].entry.title).toBe('Love Story');
    });
  });

  describe('End-to-End Workflow', () => {
    it('should complete full workflow: fetch -> analyze -> export', async () => {
      // Mock data
      const mockChartData = {
        songs: [
          { rank: 1, title: 'Song 1', artist: 'Artist 1', position: {} },
          { rank: 2, title: 'Song 2', artist: 'Artist 2', position: {} }
        ],
        week: '2024-01-01'
      };

      getChart.mockImplementation((chartType: string, date: string, callback: Function) => {
        callback(null, mockChartData);
      });

      // 1. Fetch chart
      const chart = await brickCharts.getChart('hot-100');
      expect(chart.entries).toHaveLength(2);

      // 2. Export chart
      const exportManager = new ExportManager();
      const exportResult = await exportManager.exportChartData(chart, {
        format: 'json'
      });
      expect(exportResult.success).toBe(true);

      // 3. Search within chart
      const searchEngine = new SearchEngine();
      searchEngine.indexChartData([chart]);
      const { results } = searchEngine.search({ title: 'Song' });
      expect(results.length).toBeGreaterThan(0);
    });
  });
});

describe('Error Handling', () => {
  let brickCharts: BrickCharts;

  beforeEach(() => {
    brickCharts = new BrickCharts({ enableCache: false });
  });

  it('should handle API errors gracefully', async () => {
    getChart.mockImplementation((chartType: string, date: string, callback: Function) => {
      callback(new Error('Network timeout'), null);
    });

    await expect(brickCharts.getChart('hot-100')).rejects.toThrow('Network timeout');
  });

  it('should handle malformed chart data', async () => {
    getChart.mockImplementation((chartType: string, date: string, callback: Function) => {
      callback(null, { invalid: 'data' });
    });

    const chart = await brickCharts.getChart('hot-100');
    expect(chart.entries).toHaveLength(0);
  });

  it('should handle search with no indexed data', () => {
    const searchEngine = new SearchEngine();
    const { results } = searchEngine.search({ artist: 'Taylor Swift' });
    
    expect(results).toHaveLength(0);
  });
}); 