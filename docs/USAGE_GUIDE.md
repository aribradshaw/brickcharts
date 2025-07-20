# 🎵 BrickCharts Usage Guide

Complete guide to using BrickCharts for Billboard and Last.FM chart data management with visualizations, search, and export capabilities.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Core Features](#core-features)
3. [Advanced Search](#advanced-search)
4. [Export Functionality](#export-functionality)
5. [React Components](#react-components)
6. [Testing & Development](#testing--development)
7. [Performance Tips](#performance-tips)
8. [Examples](#examples)

## 🚀 Quick Start

### Installation

```bash
npm install brickcharts
```

### Basic Usage

```typescript
import { BrickCharts, ChartSource } from 'brickcharts';

// Initialize the library
const brickCharts = new BrickCharts({
  enableCache: true,
  defaultSource: ChartSource.BILLBOARD
});

// Get current Billboard Hot 100
const hot100 = await brickCharts.getChart('hot-100');
console.log(`Current #1: ${hot100.entries[0].title} - ${hot100.entries[0].artist}`);
```

## 🎯 Core Features

### 1. Chart Fetching

```typescript
// Current charts
const hot100 = await brickCharts.getChart('hot-100');
const billboard200 = await brickCharts.getChart('billboard-200');

// Historical charts
const historicalChart = await brickCharts.getChart('hot-100', ChartSource.BILLBOARD, {
  date: new Date('2023-01-01')
});

// Available charts
const charts = await brickCharts.getAvailableCharts();
console.log(`Available charts: ${charts.length}`);
```

### 2. Trend Analysis

```typescript
// Get trends for the past week
const trends = await brickCharts.getTrends('hot-100');

console.log(`New entries: ${trends.newEntries}`);
console.log(`Top climbers:`, trends.topMovers.climbers.slice(0, 5));
console.log(`Top fallers:`, trends.topMovers.fallers.slice(0, 5));

// Compare specific dates
const comparison = await brickCharts.compareCharts(
  'hot-100',
  new Date('2023-01-01'),
  new Date('2023-01-08')
);
```

### 3. Health Monitoring

```typescript
// Check service health
const health = await brickCharts.healthCheck();
console.log('Service Health:', Object.fromEntries(health));

// Cache statistics
const cacheStats = await brickCharts.getCacheStats();
console.log('Cache Performance:', cacheStats);
```

## 🔍 Advanced Search

### Basic Search Setup

```typescript
import { SearchEngine } from 'brickcharts';

const searchEngine = new SearchEngine();

// Index chart data for searching
const charts = [
  await brickCharts.getChart('hot-100'),
  await brickCharts.getChart('billboard-200')
];
searchEngine.indexChartData(charts);
```

### Search Examples

```typescript
// Basic artist search
const { results, stats } = searchEngine.search({
  artist: 'Taylor Swift',
  limit: 10
});

console.log(`Found ${results.length} results in ${stats.searchTime}ms`);
results.forEach(result => {
  console.log(`${result.entry.title} - Rank #${result.entry.rank}`);
});

// Advanced search with filters
const advancedResults = searchEngine.search({
  artist: 'Drake',
  rankRange: { min: 1, max: 10 },
  weeksRange: { min: 5, max: 50 },
  fuzzy: true
});

// Quick search for autocomplete
const suggestions = searchEngine.quickSearch('tay', 'artist', 5);
console.log('Suggestions:', suggestions);

// Find similar tracks
const entry = hot100.entries[0];
const similar = searchEngine.findSimilar(entry, 5);
console.log('Similar tracks:', similar.map(s => s.entry.title));
```

## 📤 Export Functionality

### Basic Export

```typescript
import { ExportManager } from 'brickcharts';

const exportManager = new ExportManager();

// Export as CSV
const csvResult = await exportManager.exportChartData(hot100, {
  format: 'csv',
  includeMetadata: true,
  filename: 'hot100-current.csv'
});

if (csvResult.success) {
  console.log(`Exported: ${csvResult.filename}`);
  ExportManager.downloadBlob(csvResult.blob!, csvResult.filename);
}

// Export as JSON
const jsonResult = await exportManager.exportChartData(hot100, {
  format: 'json',
  includeMetadata: true
});
```

### Advanced Export Options

```typescript
// Export trends data
const trendsResult = await exportManager.exportTrends(trends.trends, {
  format: 'csv',
  filename: 'trends-analysis.csv'
});

// Export analytics
const analyticsResult = await exportManager.exportAnalytics(trends, {
  format: 'json'
});

// Export as SVG image
const svgResult = await exportManager.exportChartData(hot100, {
  format: 'svg',
  imageOptions: {
    width: 1200,
    height: 800,
    backgroundColor: 'white'
  }
});

// Validate export options
const validation = ExportManager.validateOptions({
  format: 'csv',
  filename: 'my-chart.csv'
});

if (!validation.valid) {
  console.error('Export errors:', validation.errors);
}
```

### Supported Export Formats

- **CSV**: Spreadsheet format with customizable columns
- **JSON**: Complete data with metadata
- **SVG**: Scalable vector graphics charts
- **PNG**: Raster images (coming soon)
- **PDF**: Formatted reports (coming soon)

## ⚛️ React Components

### Basic Chart Component

```typescript
import React from 'react';
import { ChartLine } from 'brickcharts/components';
import { useBrickCharts } from './hooks/useBrickCharts';

function ChartVisualization() {
  const { chartData, loading, error } = useBrickCharts('hot-100');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ChartLine
      data={chartData}
      showTrends={true}
      showLabels={true}
      theme={{
        primary: '#3b82f6',
        background: '#ffffff'
      }}
      onChartClick={(entry) => {
        console.log('Clicked:', entry.title);
      }}
    />
  );
}
```

### Chart Dashboard

```typescript
import { ChartDashboard } from 'brickcharts/components';

function Dashboard() {
  const charts = [hot100Data, billboard200Data];
  
  return (
    <ChartDashboard
      charts={charts}
      analytics={trendsData}
      layout="grid"
      exportEnabled={true}
      theme={{ primary: '#8b5cf6' }}
    />
  );
}
```

### Available Components

- `ChartLine`: Line charts for trends over time
- `ChartBar`: Bar charts for current rankings
- `ChartBubble`: Bubble charts for multi-dimensional data
- `ChartHeatmap`: Heat maps for time-series analysis
- `ChartTimeline`: Timeline views for track history
- `ChartDashboard`: Complete dashboard with multiple charts
- `TrendAnalyzer`: Specialized component for trend visualization
- `ChartComparison`: Side-by-side chart comparisons

## 🧪 Testing & Development

### Interactive Testing

```bash
# Start interactive tester
npm run test:interactive

# This provides a CLI menu to test:
# - Chart fetching
# - Search functionality
# - Export features
# - Performance analysis
# - Cache behavior
```

### Unit Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Custom Test Setup

```typescript
import { BrickCharts, SearchEngine, ExportManager } from 'brickcharts';

// Test configuration
const testBrickCharts = new BrickCharts({
  enableCache: false, // Disable for consistent testing
  defaultSource: ChartSource.BILLBOARD
});

// Mock data for testing
const mockChartData = {
  chartType: 'test-chart',
  date: new Date(),
  entries: [
    { rank: 1, title: 'Test Song', artist: 'Test Artist' }
  ],
  source: ChartSource.BILLBOARD,
  totalEntries: 1
};
```

## ⚡ Performance Tips

### 1. Caching Configuration

```typescript
const brickCharts = new BrickCharts({
  enableCache: true,
  cacheOptions: {
    ttl: 1000 * 60 * 30, // 30 minutes
    maxSize: 100, // Max cache entries
    persistent: true // Save to localStorage
  }
});
```

### 2. Search Optimization

```typescript
// Index data once, search multiple times
const searchEngine = new SearchEngine();
searchEngine.indexChartData(allCharts);

// Use quick search for autocomplete
const suggestions = searchEngine.quickSearch(term, 'artist', 5);

// Apply limits to large result sets
const results = searchEngine.search({
  artist: 'popular artist',
  limit: 20 // Limit results for performance
});
```

### 3. Export Optimization

```typescript
// Validate before exporting
const validation = ExportManager.validateOptions(options);
if (!validation.valid) {
  throw new Error(validation.errors.join(', '));
}

// Use appropriate formats
const csvResult = await exportManager.exportChartData(data, {
  format: 'csv', // Faster than JSON for large datasets
  includeMetadata: false // Skip if not needed
});
```

## 📋 Examples

### Complete Workflow Example

```typescript
import { BrickCharts, SearchEngine, ExportManager } from 'brickcharts';

async function completeWorkflow() {
  // 1. Initialize
  const brickCharts = new BrickCharts();
  const searchEngine = new SearchEngine();
  const exportManager = new ExportManager();

  // 2. Fetch data
  const hot100 = await brickCharts.getChart('hot-100');
  const trends = await brickCharts.getTrends('hot-100');

  // 3. Search analysis
  searchEngine.indexChartData([hot100]);
  const taylorSwiftTracks = searchEngine.search({
    artist: 'Taylor Swift',
    fuzzy: true
  });

  // 4. Export results
  await exportManager.exportChartData(hot100, {
    format: 'csv',
    filename: 'hot100-analysis.csv'
  });

  await exportManager.exportTrends(trends.trends, {
    format: 'json',
    filename: 'trends-analysis.json'
  });

  // 5. Performance monitoring
  const cacheStats = await brickCharts.getCacheStats();
  console.log('Cache efficiency:', cacheStats);
}
```

### Real-time Dashboard Example

```typescript
import React, { useState, useEffect } from 'react';
import { BrickCharts, ChartSource } from 'brickcharts';

function RealTimeDashboard() {
  const [charts, setCharts] = useState({});
  const [trends, setTrends] = useState({});
  const brickCharts = new BrickCharts();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hot100, billboard200] = await Promise.all([
          brickCharts.getChart('hot-100'),
          brickCharts.getChart('billboard-200')
        ]);

        const hot100Trends = await brickCharts.getTrends('hot-100');

        setCharts({ hot100, billboard200 });
        setTrends({ hot100: hot100Trends });
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    fetchData();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h1>Music Charts Dashboard</h1>
      
      {charts.hot100 && (
        <div className="chart-section">
          <h2>Billboard Hot 100</h2>
          <ChartLine 
            data={charts.hot100}
            showTrends={true}
            height={400}
          />
        </div>
      )}

      {trends.hot100 && (
        <div className="trends-section">
          <h2>Trends Analysis</h2>
          <TrendAnalyzer 
            trends={trends.hot100.trends}
            chartType="hot-100"
          />
        </div>
      )}
    </div>
  );
}
```

### Advanced Search Interface

```typescript
import React, { useState } from 'react';
import { SearchEngine } from 'brickcharts';

function AdvancedSearchInterface({ searchEngine }) {
  const [query, setQuery] = useState({
    artist: '',
    title: '',
    fuzzy: false,
    rankRange: { min: 1, max: 100 }
  });
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async () => {
    const { results: searchResults } = searchEngine.search(query);
    setResults(searchResults);
  };

  const handleQuickSearch = (term, field) => {
    const suggestions = searchEngine.quickSearch(term, field, 5);
    setSuggestions(suggestions);
  };

  return (
    <div className="search-interface">
      <div className="search-form">
        <input
          type="text"
          placeholder="Artist name"
          value={query.artist}
          onChange={(e) => {
            setQuery({...query, artist: e.target.value});
            handleQuickSearch(e.target.value, 'artist');
          }}
        />
        
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map(suggestion => (
              <div key={suggestion} onClick={() => 
                setQuery({...query, artist: suggestion})
              }>
                {suggestion}
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="search-results">
        {results.map(result => (
          <div key={`${result.entry.title}-${result.entry.artist}`}>
            <h3>{result.entry.title}</h3>
            <p>{result.entry.artist} - Rank #{result.entry.rank}</p>
            <p>Score: {result.score.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 Configuration Options

### BrickCharts Configuration

```typescript
interface BrickChartsConfig {
  enableCache?: boolean;           // Enable/disable caching
  defaultSource?: ChartSource;     // Default chart source
  cacheOptions?: {
    ttl: number;                   // Cache TTL in milliseconds
    maxSize: number;               // Maximum cache size
    persistent: boolean;           // Persist to localStorage
  };
  apiKeys?: {
    lastfm?: string;              // Last.FM API key
    spotify?: string;             // Spotify API key (future)
  };
}
```

### Search Configuration

```typescript
interface SearchQuery {
  title?: string;                  // Song title to search
  artist?: string;                 // Artist name to search
  album?: string;                  // Album name to search
  chartType?: string;              // Specific chart type
  source?: ChartSource;            // Chart source
  dateRange?: {                    // Date range filter
    start: Date;
    end: Date;
  };
  rankRange?: {                    // Rank range filter
    min: number;
    max: number;
  };
  fuzzy?: boolean;                 // Enable fuzzy matching
  limit?: number;                  // Limit number of results
}
```

### Export Configuration

```typescript
interface ExportOptions {
  format: ExportFormat;            // Export format
  filename?: string;               // Custom filename
  includeMetadata?: boolean;       // Include metadata
  dateFormat?: string;             // Date format string
  imageOptions?: {                 // Image export options
    width?: number;
    height?: number;
    quality?: number;
    backgroundColor?: string;
  };
}
```

## 🆘 Troubleshooting

### Common Issues

1. **Chart not loading**: Check internet connection and Billboard service status
2. **Search returns no results**: Ensure chart data is indexed first
3. **Export fails**: Validate export options before attempting export
4. **Cache issues**: Clear cache using `brickCharts.clearCache()`

### Debug Mode

```typescript
// Enable debug logging
const brickCharts = new BrickCharts({
  enableCache: true,
  // Add debug logging
});

// Monitor cache performance
const stats = await brickCharts.getCacheStats();
console.log('Cache stats:', stats);

// Check service health
const health = await brickCharts.healthCheck();
console.log('Service health:', Object.fromEntries(health));
```

---

## 🎉 You're Ready!

You now have everything you need to build powerful music chart applications with BrickCharts. The library provides:

- ✅ **Billboard Chart Integration** - Access to 255+ Billboard charts
- ✅ **Advanced Search** - Fuzzy matching, filtering, autocomplete  
- ✅ **Export Functions** - CSV, JSON, SVG exports with validation
- ✅ **React Components** - Ready-to-use visualization components
- ✅ **Comprehensive Testing** - Unit tests and interactive testing tools
- ✅ **Performance Optimization** - Smart caching and efficient data management

Start building amazing music data applications! 🚀 