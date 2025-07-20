# 🎵 BrickCharts

A comprehensive TypeScript library for managing Billboard and Last.FM charts with powerful data management, visualization support, and easy-to-use APIs.

[![npm version](https://badge.fury.io/js/brickcharts.svg)](https://badge.fury.io/js/brickcharts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/aribradshaw/brickcharts.svg)](https://github.com/aribradshaw/brickcharts/releases)

## ✨ Features

- 🎯 **Billboard Integration**: Complete access to 255+ Billboard charts via `@aribradshaw/billboard-top-100`
- 🌐 **Last.FM Integration**: Global music charts and personal listening data
- 📈 **Trend Analysis**: Compare charts across time periods and track movement
- 💾 **Smart Caching**: Built-in caching with localStorage persistence
- 🔍 **Search & Filter**: Find tracks and artists across multiple charts
- 📊 **Data Normalization**: Unified data format across different sources
- 🚀 **TypeScript Support**: Full type safety and IntelliSense
- ⚡ **Performance Optimized**: Efficient data fetching and caching strategies
- 👤 **Personal Charts**: Access your own Last.FM listening history
- 🧪 **Comprehensive Testing**: 10+ test suites covering all functionality

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
  defaultSource: ChartSource.BILLBOARD,
  cacheOptions: {
    ttl: 1000 * 60 * 30, // 30 minutes
    maxSize: 50,
    persistent: true
  }
});

// Get current Billboard Hot 100
const hot100 = await brickCharts.getChart('hot-100');
console.log('Current #1 song:', hot100.entries[0]);

// Get Billboard 200 Albums
const albums = await brickCharts.getChart('billboard-200');
console.log('Top album:', albums.entries[0]);

// Get trends analysis
const trends = await brickCharts.getTrends('hot-100');
console.log('Biggest climbers:', trends.topMovers.climbers.slice(0, 5));

// Get Last.FM global charts
const lastfmTracks = await brickCharts.getChart('top-tracks', ChartSource.LASTFM);
console.log('Last.FM #1 track:', lastfmTracks.entries[0]);

## 📖 API Reference

### Core Class: BrickCharts

#### Constructor

```typescript
const brickCharts = new BrickCharts(config?: BrickChartsConfig);
```

**Config Options:**
- `enableCache?: boolean` - Enable caching (default: true)
- `defaultSource?: ChartSource` - Default chart source (default: BILLBOARD)
- `cacheOptions?: CacheOptions` - Cache configuration
- `apiKeys?: { lastfm?: string }` - API keys for external services

**Chart Sources:**
- `ChartSource.BILLBOARD` - Billboard commercial charts
- `ChartSource.LASTFM` - Last.FM global and personal charts

#### Methods

##### `getChart(chartType, source?, options?)`
Get a specific chart for the current week or a specific date.

```typescript
// Current Hot 100
const chart = await brickCharts.getChart('hot-100');

// Hot 100 for specific date
const historicalChart = await brickCharts.getChart('hot-100', ChartSource.BILLBOARD, {
  date: new Date('2023-01-01')
});
```

##### `getAvailableCharts(source?)`
Get list of all available charts from a source.

```typescript
const charts = await brickCharts.getAvailableCharts();
console.log('Available charts:', charts);
```

##### `getTrends(chartType, source?, weeksBack?)`
Analyze trends by comparing current chart with previous weeks.

```typescript
const trends = await brickCharts.getTrends('hot-100', ChartSource.BILLBOARD, 2);
console.log('New entries:', trends.newEntries);
console.log('Biggest climbers:', trends.topMovers.climbers);
```

##### `compareCharts(chartType, date1, date2, source?)`
Compare two charts from different dates.

```typescript
const comparison = await brickCharts.compareCharts(
  'hot-100',
  new Date('2023-01-01'),
  new Date('2023-01-08')
);
```

##### `searchTrack(title, artist, chartType?, source?)`
Search for tracks across charts.

```typescript
const results = await brickCharts.searchTrack('', 'Taylor Swift');
results.forEach(chart => {
  console.log(`Found in ${chart.chartType}`);
});
```

### Data Types

#### ChartEntry
```typescript
interface ChartEntry {
  rank: number;
  title: string;
  artist: string;
  album?: string;
  lastWeek?: number;
  peakPosition?: number;
  weeksOnChart?: number;
  chartDate: Date;
  source: ChartSource;
  metadata?: Record<string, any>;
}
```

#### ChartData
```typescript
interface ChartData {
  chartType: string;
  date: Date;
  entries: ChartEntry[];
  source: ChartSource;
  totalEntries: number;
  metadata?: Record<string, any>;
}
```

## 📊 Available Chart Types

### Billboard Charts
- `hot-100` - Billboard Hot 100 Songs
- `billboard-200` - Billboard 200 Albums
- `artist-100` - Artist 100
- `pop-songs` - Pop Songs
- `country-songs` - Country Songs
- `rock-songs` - Rock Songs
- `r-b-songs` - R&B Songs
- `rap-songs` - Rap Songs
- `dance-songs` - Dance/Electronic Songs
- `latin-songs` - Latin Songs
- `streaming-songs` - Streaming Songs
- `radio-songs` - Radio Songs
- `digital-songs` - Digital Songs
- `social-50` - Social 50
- And 240+ more charts...

### Last.FM Charts
- `top-tracks` - Global top tracks
- `top-albums` - Global top albums
- `top-artists` - Global top artists
- `top-tracks-weekly` - Weekly top tracks
- `top-tracks-monthly` - Monthly top tracks
- `top-tracks-yearly` - Yearly top tracks
- `top-albums-weekly` - Weekly top albums
- `top-albums-monthly` - Monthly top albums
- `top-albums-yearly` - Yearly top albums
- `top-artists-weekly` - Weekly top artists
- `top-artists-monthly` - Monthly top artists
- `top-artists-yearly` - Yearly top artists

## 🛠️ Advanced Usage

### Caching Configuration

```typescript
const brickCharts = new BrickCharts({
  cacheOptions: {
    ttl: 1000 * 60 * 60, // 1 hour
    maxSize: 100,
    persistent: true // Save to localStorage
  }
});

// Clear cache
await brickCharts.clearCache();

// Get cache stats
const stats = await brickCharts.getCacheStats();
```

### Billboard Integration

```typescript
// Billboard integration is included by default
const brickCharts = new BrickCharts();

// Get current Hot 100
const hot100 = await brickCharts.getChart('hot-100');

// Get Billboard 200 albums
const albums = await brickCharts.getChart('billboard-200');

// Get historical data
const historicalChart = await brickCharts.getChart('hot-100', ChartSource.BILLBOARD, {
  date: new Date('2023-01-01')
});

// Get available charts
const availableCharts = await brickCharts.getAvailableCharts(ChartSource.BILLBOARD);
console.log('Available charts:', availableCharts.length); // 255+ charts
```

### Last.FM Integration

```typescript
// Initialize with Last.FM API key
const brickCharts = new BrickCharts({
  apiKeys: {
    lastfm: 'your-lastfm-api-key'
  }
});

// Get global Last.FM charts
const globalTracks = await brickCharts.getChart('top-tracks', ChartSource.LASTFM);

// Get personal charts (requires username)
const personalTracks = await getPersonalTopTracks(apiKey, 'username', 10);
```

### Error Handling

```typescript
try {
  const chart = await brickCharts.getChart('hot-100');
} catch (error) {
  if (error instanceof APIError) {
    console.log('API Error:', error.message);
    console.log('Status Code:', error.statusCode);
    console.log('Source:', error.source);
  }
}
```

### Health Monitoring

```typescript
const health = await brickCharts.healthCheck();
console.log('Service Health:', Object.fromEntries(health));
```

## 🔧 Development & Testing

### 🚀 Quick Start for New Users

```bash
# 1. Clone the repository
git clone https://github.com/aribradshaw/brickcharts.git
cd brickcharts

# 2. Install dependencies
npm install

# 3. Start with interactive testing (RECOMMENDED)
npm run test:interactive

# 4. Run the comprehensive demo
npm run demo

# 5. Test Last.FM integration (requires API key)
export LASTFM_API_KEY="your-api-key"
npm run demo:lastfm

# 6. Test combined Billboard + Last.FM
npm run demo:combined

# 7. Test personal Last.FM charts
export LASTFM_USERNAME="your-username"
npm run demo:personal-lastfm

# 8. Build the library
npm run build
```

### 📋 Testing Guide

#### **Interactive Testing Suite** (Best First Experience)
```bash
npm run test:interactive
```
**What it does:**
- Menu-driven CLI interface
- Test all features: fetching, search, export, caching
- Real-time performance metrics
- Perfect for exploring capabilities

**Try these features:**
1. **Chart Fetching** - Get Hot 100, Billboard 200, historical data
2. **Search Engine** - Artist search, fuzzy matching, autocomplete
3. **Export Functions** - CSV, JSON, SVG generation
4. **Performance Testing** - Cache behavior, response times
5. **Health Monitoring** - Service availability

#### **Core Demo** (Production Examples)
```bash
npm run demo
```
**What you'll see:**
- ✅ Health check of Billboard services
- 📊 255+ available charts listed
- 🔥 Current Hot 100 with trend analysis
- 📈 Week-over-week comparisons
- 💾 Cache performance metrics
- 🔍 Search functionality demo

#### **Last.FM Demo** (Global Charts)
```bash
npm run demo:lastfm
```
**What you'll see:**
- ✅ Last.FM global top tracks, albums, artists
- 📊 Time-period specific charts (weekly, monthly, yearly)
- 🎧 Play count and listener statistics
- 💾 Unified caching with Billboard

#### **Combined Demo** (Cross-Platform Analysis)
```bash
npm run demo:combined
```
**What you'll see:**
- ✅ Billboard vs Last.FM chart comparisons
- 🎯 Tracks popular on both platforms
- 📊 Genre-specific analysis
- 📈 Time-based trend analysis

#### **Personal Last.FM Demo** (Individual Data)
```bash
npm run demo:personal-lastfm
```
**What you'll see:**
- ✅ Personal top tracks, artists, albums
- 📅 Recent listening activity
- 📊 Time-period analysis (weekly, monthly, yearly)
- ❤️ Loved tracks collection

#### **Unit Tests** (Developer Validation)
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm test --watch
```

#### **Build Testing** (Production Ready)
```bash
npm run build
```
**Validates:**
- TypeScript compilation
- Bundle generation (ES + UMD)
- Type declaration files
- Tree-shaking optimization

### 🎯 What to Test & Expect

#### **Chart Data Fetching**
```typescript
// Should work immediately
const hot100 = await brickCharts.getChart('hot-100');
// Expected: ~100 entries, 1-3 second fetch time
```

**Test scenarios:**
- ✅ Current charts load in 1-3 seconds
- ✅ 255+ charts available
- ✅ Historical data from past weeks
- ✅ Proper error handling for invalid dates

#### **Advanced Search**
```typescript
// Try these searches
searchEngine.search({ artist: 'Taylor Swift' });        // Exact match
searchEngine.search({ artist: 'Tayler Swift', fuzzy: true }); // Fuzzy match
searchEngine.quickSearch('tay', 'artist');              // Autocomplete
```

**Expected results:**
- ✅ Fast search results (<50ms after indexing)
- ✅ Fuzzy matching handles typos
- ✅ Rank filtering works correctly
- ✅ Autocomplete provides relevant suggestions

#### **Export Functionality**
```typescript
// Test all export formats
await exportManager.exportChartData(chart, { format: 'csv' });
await exportManager.exportChartData(chart, { format: 'json' });
await exportManager.exportChartData(chart, { format: 'svg' });
```

**Expected outputs:**
- ✅ CSV with proper escaping and metadata
- ✅ JSON with complete data structure
- ✅ SVG charts with proper dimensions
- ✅ Validation prevents invalid options

#### **Performance Benchmarks**
- **First fetch**: 1-3 seconds (network dependent)
- **Cached fetch**: <50ms
- **Search**: <50ms after indexing
- **Export**: <500ms for typical chart sizes

### 🐛 Common Issues & Solutions

**"Billboard service unavailable"**
- Wait 5-10 minutes (temporary service issues)
- Check internet connection
- Try different chart types

**"Search returns no results"** 
- Ensure chart data is indexed first: `searchEngine.indexChartData([chart])`
- Try fuzzy search for partial matches
- Check spelling and try broader terms

**"Export fails"**
- Validate options first: `ExportManager.validateOptions(options)`
- Ensure browser supports Blob downloads
- Check file permissions for Node.js environments

**"Build errors"**
- Run `npm install` to ensure dependencies
- Check TypeScript version compatibility
- Clear node_modules and reinstall if needed

### 🔄 Development Workflow

```bash
# 1. Make changes to source code
# 2. Test changes
npm test

# 3. Try interactive testing
npm run test:interactive

# 4. Verify demo still works
npm run demo

# 5. Build for production
npm run build

# 6. Commit and push
git add .
git commit -m "Your changes"
git push
```

### 📊 Performance Monitoring

The library includes built-in performance monitoring:

```typescript
// Check cache performance
const stats = await brickCharts.getCacheStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);

// Monitor service health
const health = await brickCharts.healthCheck();
console.log('Services:', Object.fromEntries(health));
```

## 🗺️ Roadmap

### ✅ **Completed Features**
- [x] **Billboard Integration** - Full access to 255+ Billboard charts via `@aribradshaw/billboard-top-100`
- [x] **Last.FM Integration** - Global charts and personal listening data
- [x] **Advanced Search Engine** - Fuzzy matching, filtering, autocomplete
- [x] **Export Functions** - CSV, JSON, SVG exports with validation
- [x] **React Components** - TypeScript chart visualization components
- [x] **Performance Optimization** - Smart caching with localStorage
- [x] **Comprehensive Testing** - 10+ test suites covering all functionality
- [x] **Type Safety** - Full TypeScript support with strict typing
- [x] **Cross-Platform Analysis** - Billboard vs Last.FM comparisons
- [x] **Stress Testing** - Robust error handling and performance validation

### 🚧 **In Progress**
- [ ] **Additional React Components** - Bar, Bubble, Heatmap, Timeline charts
- [ ] **Component Library** - Dashboard, TrendAnalyzer, ChartComparison
- [ ] **Image Export** - PNG rendering with html2canvas
- [ ] **PDF Export** - Complete report generation
- [ ] **Enhanced Billboard Features** - Historical data improvements and custom chart types

### 🔮 **Future Enhancements**
- [ ] **Spotify Integration** - Connect with Spotify API for streaming data
- [ ] **Real-time Updates** - WebSocket support for live chart updates
- [ ] **Genre Analysis** - Advanced genre and mood analysis
- [ ] **Playlist Generation** - Auto-generate playlists from chart data
- [ ] **Apple Music Charts** - Additional chart source integration
- [ ] **Chart Predictions** - ML-based trend forecasting
- [ ] **Advanced Personal Analytics** - Deep listening pattern analysis

### 💡 **Community Requested**
- [ ] **Mobile Optimization** - React Native compatible components
- [ ] **Chart Animations** - Smooth transitions and loading states

## 🔑 API Keys

### Last.FM API Key
To use Last.FM features, you'll need a free API key:

1. Visit [Last.FM API Registration](https://www.last.fm/api/account/create)
2. Create a free account or log in
3. Create a new application
4. Copy your API key

```bash
# Set environment variable
export LASTFM_API_KEY="your-api-key-here"

# Or use in code
const brickCharts = new BrickCharts({
  apiKeys: {
    lastfm: 'your-api-key-here'
  }
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Brickstone Studios LLC

## 👨‍💻 Author

**Ari Daniel Bradshaw**   
Brickstone Studios LLC

## 🙏 Acknowledgments

- [@aribradshaw/billboard-top-100](https://github.com/aribradshaw/billboard-top-100) for Billboard API access
- Billboard.com for providing music chart data
- The Billboard Top 100 community for maintaining the original package

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.