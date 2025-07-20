import { BrickCharts, ChartSource } from '../src';
import { SearchEngine } from '../src/search/SearchEngine';
import { ExportManager } from '../src/export/ExportManager';
import readline from 'readline';

interface TestSession {
  brickCharts: BrickCharts;
  searchEngine: SearchEngine;
  exportManager: ExportManager;
  currentChart?: any;
  currentTrends?: any;
}

class InteractiveTester {
  private rl: readline.Interface;
  private session: TestSession;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.session = {
      brickCharts: new BrickCharts({
        enableCache: true,
        defaultSource: ChartSource.BILLBOARD,
        cacheOptions: {
          ttl: 1000 * 60 * 30, // 30 minutes
          maxSize: 50,
          persistent: false // Disable for testing
        }
      }),
      searchEngine: new SearchEngine(),
      exportManager: new ExportManager()
    };
  }

  async start(): Promise<void> {
    console.log('\n🎵 BrickCharts Interactive Tester');
    console.log('=====================================');
    console.log('Test all features of the BrickCharts library interactively!\n');

    await this.showMainMenu();
  }

  private async showMainMenu(): Promise<void> {
    console.log('\n📋 Main Menu:');
    console.log('1.  🔍 Test Chart Fetching');
    console.log('2.  📊 Test Available Charts');
    console.log('3.  📈 Test Trends Analysis');
    console.log('4.  🔎 Test Search Features');
    console.log('5.  📤 Test Export Functions');
    console.log('6.  💾 Test Caching');
    console.log('7.  ⚡ Test Performance');
    console.log('8.  🏥 Test Health Check');
    console.log('9.  📚 Test All Features (Demo)');
    console.log('10. 🧪 Run Unit Tests');
    console.log('0.  ❌ Exit');

    const choice = await this.prompt('\nEnter your choice (0-10): ');
    await this.handleMainMenuChoice(choice.trim());
  }

  private async handleMainMenuChoice(choice: string): Promise<void> {
    try {
      switch (choice) {
        case '1':
          await this.testChartFetching();
          break;
        case '2':
          await this.testAvailableCharts();
          break;
        case '3':
          await this.testTrendsAnalysis();
          break;
        case '4':
          await this.testSearchFeatures();
          break;
        case '5':
          await this.testExportFunctions();
          break;
        case '6':
          await this.testCaching();
          break;
        case '7':
          await this.testPerformance();
          break;
        case '8':
          await this.testHealthCheck();
          break;
        case '9':
          await this.runFullDemo();
          break;
        case '10':
          await this.runUnitTests();
          break;
        case '0':
          console.log('\nGoodbye! 👋');
          this.rl.close();
          return;
        default:
          console.log('❌ Invalid choice. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }

    await this.showMainMenu();
  }

  private async testChartFetching(): Promise<void> {
    console.log('\n🔍 Testing Chart Fetching...');
    
    const chartType = await this.prompt('Enter chart type (default: hot-100): ') || 'hot-100';
    
    console.log(`\nFetching ${chartType}...`);
    const startTime = Date.now();
    
    try {
      const chart = await this.session.brickCharts.getChart(chartType);
      const duration = Date.now() - startTime;
      
      this.session.currentChart = chart;
      
      console.log(`✅ Success! Fetched in ${duration}ms`);
      console.log(`📊 Chart: ${chart.chartType}`);
      console.log(`📅 Date: ${chart.date.toDateString()}`);
      console.log(`🎵 Entries: ${chart.totalEntries}`);
      console.log(`🎯 Source: ${chart.source}`);
      
      console.log('\n🏆 Top 5:');
      chart.entries.slice(0, 5).forEach(entry => {
        console.log(`  ${entry.rank}. ${entry.title} - ${entry.artist}`);
        if (entry.lastWeek) {
          const change = entry.lastWeek - entry.rank;
          const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
          console.log(`     ${trend} Last week: #${entry.lastWeek}`);
        }
      });
      
    } catch (error) {
      console.error(`❌ Failed to fetch chart: ${error}`);
    }
  }

  private async testAvailableCharts(): Promise<void> {
    console.log('\n📊 Testing Available Charts...');
    
    try {
      const charts = await this.session.brickCharts.getAvailableCharts();
      
      console.log(`✅ Found ${charts.length} available charts:`);
      
      // Show first 20 charts
      charts.slice(0, 20).forEach((chart, index) => {
        console.log(`  ${index + 1}. ${chart}`);
      });
      
      if (charts.length > 20) {
        console.log(`  ... and ${charts.length - 20} more charts`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to fetch available charts: ${error}`);
    }
  }

  private async testTrendsAnalysis(): Promise<void> {
    console.log('\n📈 Testing Trends Analysis...');
    
    if (!this.session.currentChart) {
      console.log('📝 No current chart data. Fetching Hot 100...');
      try {
        this.session.currentChart = await this.session.brickCharts.getChart('hot-100');
      } catch (error) {
        console.error('❌ Failed to fetch chart for trends analysis');
        return;
      }
    }
    
    const weeksBack = await this.prompt('Weeks back for comparison (default: 1): ') || '1';
    
    try {
      const trends = await this.session.brickCharts.getTrends(
        this.session.currentChart.chartType,
        ChartSource.BILLBOARD,
        parseInt(weeksBack)
      );
      
      this.session.currentTrends = trends;
      
      console.log('✅ Trends Analysis Complete!');
      console.log(`📊 Total entries: ${trends.totalEntries}`);
      console.log(`🆕 New entries: ${trends.newEntries}`);
      console.log(`📉 Dropped entries: ${trends.droppedEntries}`);
      
      if (trends.topMovers.climbers.length > 0) {
        console.log('\n🚀 Top Climbers:');
        trends.topMovers.climbers.slice(0, 5).forEach(mover => {
          console.log(`  ${mover.entry.title} - ${mover.entry.artist} (+${mover.positionChange})`);
        });
      }
      
      if (trends.topMovers.fallers.length > 0) {
        console.log('\n📉 Top Fallers:');
        trends.topMovers.fallers.slice(0, 5).forEach(mover => {
          console.log(`  ${mover.entry.title} - ${mover.entry.artist} (${mover.positionChange})`);
        });
      }
      
    } catch (error) {
      console.error(`❌ Trends analysis failed: ${error}`);
    }
  }

  private async testSearchFeatures(): Promise<void> {
    console.log('\n🔎 Testing Search Features...');
    
    // Index current chart data if available
    if (this.session.currentChart) {
      console.log('📚 Indexing current chart data...');
      this.session.searchEngine.indexChartData([this.session.currentChart]);
    }
    
    console.log('\nSearch options:');
    console.log('1. Search by artist');
    console.log('2. Search by title');
    console.log('3. Advanced search');
    console.log('4. Quick search (autocomplete)');
    console.log('5. Find similar tracks');
    
    const choice = await this.prompt('Choose search type (1-5): ');
    
    try {
      switch (choice.trim()) {
        case '1':
          await this.testArtistSearch();
          break;
        case '2':
          await this.testTitleSearch();
          break;
        case '3':
          await this.testAdvancedSearch();
          break;
        case '4':
          await this.testQuickSearch();
          break;
        case '5':
          await this.testSimilarTracks();
          break;
        default:
          console.log('❌ Invalid choice');
      }
    } catch (error) {
      console.error(`❌ Search failed: ${error}`);
    }
  }

  private async testArtistSearch(): Promise<void> {
    const artist = await this.prompt('Enter artist name: ');
    const fuzzy = await this.prompt('Use fuzzy matching? (y/n): ') === 'y';
    
    const { results, stats } = this.session.searchEngine.search({
      artist,
      fuzzy,
      limit: 10
    });
    
    console.log(`\n✅ Found ${results.length} results in ${stats.searchTime}ms`);
    console.log(`📊 Stats: ${stats.exactMatches} exact, ${stats.partialMatches} partial, ${stats.fuzzyMatches} fuzzy`);
    
    results.forEach(result => {
      console.log(`  🎵 ${result.entry.title} - ${result.entry.artist} (Score: ${result.score.toFixed(2)})`);
      console.log(`     Rank: #${result.entry.rank} in ${result.chartData.chartType}`);
    });
  }

  private async testTitleSearch(): Promise<void> {
    const title = await this.prompt('Enter song title: ');
    const fuzzy = await this.prompt('Use fuzzy matching? (y/n): ') === 'y';
    
    const { results, stats } = this.session.searchEngine.search({
      title,
      fuzzy,
      limit: 10
    });
    
    console.log(`\n✅ Found ${results.length} results in ${stats.searchTime}ms`);
    
    results.forEach(result => {
      console.log(`  🎵 ${result.entry.title} - ${result.entry.artist} (Score: ${result.score.toFixed(2)})`);
      result.matches.forEach(match => {
        console.log(`    📍 ${match.field}: ${match.matchType} match (${(match.confidence * 100).toFixed(1)}%)`);
      });
    });
  }

  private async testAdvancedSearch(): Promise<void> {
    console.log('\n🔧 Advanced Search Builder');
    
    const artist = await this.prompt('Artist (optional): ');
    const title = await this.prompt('Title (optional): ');
    const minRank = await this.prompt('Min rank (optional): ');
    const maxRank = await this.prompt('Max rank (optional): ');
    const fuzzy = await this.prompt('Use fuzzy matching? (y/n): ') === 'y';
    
    const query: any = { fuzzy, limit: 20 };
    if (artist) query.artist = artist;
    if (title) query.title = title;
    if (minRank) query.rankRange = { min: parseInt(minRank), max: parseInt(maxRank) || 100 };
    
    const { results, stats } = this.session.searchEngine.search(query);
    
    console.log(`\n✅ Advanced search complete!`);
    console.log(`📊 ${results.length} results in ${stats.searchTime}ms`);
    console.log(`🎯 Searched ${stats.chartsSearched} charts`);
    
    results.slice(0, 10).forEach(result => {
      console.log(`  🎵 ${result.entry.title} - ${result.entry.artist}`);
      console.log(`     Rank: #${result.entry.rank}, Score: ${result.score.toFixed(2)}`);
    });
  }

  private async testQuickSearch(): Promise<void> {
    const term = await this.prompt('Enter search term for autocomplete: ');
    const field = await this.prompt('Search field (title/artist/album): ') as any || 'title';
    
    const suggestions = this.session.searchEngine.quickSearch(term, field, 10);
    
    console.log(`\n✅ Autocomplete suggestions for "${term}"`);
    suggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion}`);
    });
  }

  private async testSimilarTracks(): Promise<void> {
    if (!this.session.currentChart?.entries?.length) {
      console.log('❌ No chart data available for similarity search');
      return;
    }
    
    const entry = this.session.currentChart.entries[0];
    console.log(`\n🔍 Finding tracks similar to: ${entry.title} - ${entry.artist}`);
    
    const similar = this.session.searchEngine.findSimilar(entry, 5);
    
    console.log(`\n✅ Found ${similar.length} similar tracks:`);
    similar.forEach(result => {
      console.log(`  🎵 ${result.entry.title} - ${result.entry.artist} (Score: ${result.score.toFixed(2)})`);
    });
  }

  private async testExportFunctions(): Promise<void> {
    console.log('\n📤 Testing Export Functions...');
    
    if (!this.session.currentChart) {
      console.log('📝 No chart data. Fetching Hot 100...');
      try {
        this.session.currentChart = await this.session.brickCharts.getChart('hot-100');
      } catch (error) {
        console.error('❌ Failed to fetch chart for export');
        return;
      }
    }
    
    console.log('\nExport options:');
    console.log('1. Export as CSV');
    console.log('2. Export as JSON');
    console.log('3. Export as SVG image');
    console.log('4. Export trends data');
    
    const choice = await this.prompt('Choose export format (1-4): ');
    
    try {
      let result;
      
      switch (choice.trim()) {
        case '1':
          result = await this.session.exportManager.exportChartData(this.session.currentChart, {
            format: 'csv',
            includeMetadata: true
          });
          break;
          
        case '2':
          result = await this.session.exportManager.exportChartData(this.session.currentChart, {
            format: 'json',
            includeMetadata: true
          });
          break;
          
        case '3':
          result = await this.session.exportManager.exportChartData(this.session.currentChart, {
            format: 'svg',
            imageOptions: { width: 1200, height: 800 }
          });
          break;
          
        case '4':
          if (this.session.currentTrends) {
            result = await this.session.exportManager.exportTrends(this.session.currentTrends.trends, {
              format: 'json'
            });
          } else {
            console.log('❌ No trends data available. Run trends analysis first.');
            return;
          }
          break;
          
        default:
          console.log('❌ Invalid choice');
          return;
      }
      
      if (result.success) {
        console.log('✅ Export successful!');
        console.log(`📁 Filename: ${result.filename}`);
        console.log(`📊 Size: ${result.size} bytes`);
        console.log(`🔗 URL: ${result.url ? 'Generated (blob)' : 'N/A'}`);
        
        if (result.data && typeof result.data === 'string' && result.data.length < 1000) {
          console.log('\n📄 Preview:');
          console.log(result.data.substring(0, 500) + (result.data.length > 500 ? '...' : ''));
        }
      } else {
        console.log(`❌ Export failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`❌ Export error: ${error}`);
    }
  }

  private async testCaching(): Promise<void> {
    console.log('\n💾 Testing Caching...');
    
    // Clear cache first
    await this.session.brickCharts.clearCache();
    console.log('🗑️ Cache cleared');
    
    // First fetch (should be slow)
    console.log('\n⏱️ First fetch (no cache):');
    const start1 = Date.now();
    const chart1 = await this.session.brickCharts.getChart('hot-100');
    const duration1 = Date.now() - start1;
    console.log(`✅ Fetched in ${duration1}ms`);
    
    // Second fetch (should be fast)
    console.log('\n⚡ Second fetch (from cache):');
    const start2 = Date.now();
    const chart2 = await this.session.brickCharts.getChart('hot-100');
    const duration2 = Date.now() - start2;
    console.log(`✅ Fetched in ${duration2}ms`);
    
    console.log(`\n📊 Performance improvement: ${((duration1 - duration2) / duration1 * 100).toFixed(1)}%`);
    
    // Cache stats
    const stats = await this.session.brickCharts.getCacheStats();
    console.log('\n📈 Cache Statistics:');
    console.log(JSON.stringify(stats, null, 2));
  }

  private async testPerformance(): Promise<void> {
    console.log('\n⚡ Testing Performance...');
    
    const iterations = 5;
    const durations: number[] = [];
    
    console.log(`\n🔄 Running ${iterations} chart fetches...`);
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await this.session.brickCharts.getChart('hot-100');
      const duration = Date.now() - start;
      durations.push(duration);
      console.log(`  ${i + 1}. ${duration}ms`);
    }
    
    const avgDuration = durations.reduce((a, b) => a + b) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    console.log('\n📊 Performance Results:');
    console.log(`  Average: ${avgDuration.toFixed(1)}ms`);
    console.log(`  Fastest: ${minDuration}ms`);
    console.log(`  Slowest: ${maxDuration}ms`);
    console.log(`  Variance: ${((maxDuration - minDuration) / avgDuration * 100).toFixed(1)}%`);
  }

  private async testHealthCheck(): Promise<void> {
    console.log('\n🏥 Testing Health Check...');
    
    try {
      const health = await this.session.brickCharts.healthCheck();
      
      console.log('✅ Health Check Results:');
      for (const [source, status] of health) {
        const icon = status ? '🟢' : '🔴';
        console.log(`  ${icon} ${source}: ${status ? 'Healthy' : 'Unhealthy'}`);
      }
      
      const healthySources = Array.from(health.values()).filter(Boolean).length;
      const totalSources = health.size;
      console.log(`\n📊 Overall Health: ${healthySources}/${totalSources} sources healthy`);
      
    } catch (error) {
      console.error(`❌ Health check failed: ${error}`);
    }
  }

  private async runFullDemo(): Promise<void> {
    console.log('\n📚 Running Full Feature Demo...');
    console.log('This will test all major features automatically.\n');
    
    try {
      // 1. Health Check
      console.log('1️⃣ Testing health...');
      const health = await this.session.brickCharts.healthCheck();
      console.log(`   ✅ ${Array.from(health.values()).filter(Boolean).length} sources healthy`);
      
      // 2. Fetch Charts
      console.log('\n2️⃣ Fetching charts...');
      const hot100 = await this.session.brickCharts.getChart('hot-100');
      console.log(`   ✅ Hot 100: ${hot100.totalEntries} entries`);
      
      // 3. Trends Analysis
      console.log('\n3️⃣ Analyzing trends...');
      const trends = await this.session.brickCharts.getTrends('hot-100');
      console.log(`   ✅ ${trends.newEntries} new entries, ${trends.topMovers.climbers.length} climbers`);
      
      // 4. Search
      console.log('\n4️⃣ Testing search...');
      this.session.searchEngine.indexChartData([hot100]);
      const searchResults = this.session.searchEngine.search({ artist: 'taylor', fuzzy: true, limit: 3 });
      console.log(`   ✅ ${searchResults.results.length} search results`);
      
      // 5. Export
      console.log('\n5️⃣ Testing export...');
      const exportResult = await this.session.exportManager.exportChartData(hot100, { format: 'json' });
      console.log(`   ✅ Export ${exportResult.success ? 'successful' : 'failed'}`);
      
      // 6. Cache Performance
      console.log('\n6️⃣ Testing cache performance...');
      const start = Date.now();
      await this.session.brickCharts.getChart('hot-100'); // Should be cached
      const cachedDuration = Date.now() - start;
      console.log(`   ✅ Cached fetch: ${cachedDuration}ms`);
      
      console.log('\n🎉 Full demo completed successfully!');
      
    } catch (error) {
      console.error(`❌ Demo failed: ${error}`);
    }
  }

  private async runUnitTests(): Promise<void> {
    console.log('\n🧪 Running Unit Tests...');
    console.log('(This would integrate with your actual test runner)\n');
    
    // Mock unit tests
    const tests = [
      { name: 'BrickCharts initialization', pass: true },
      { name: 'Chart data validation', pass: true },
      { name: 'Search engine indexing', pass: true },
      { name: 'Export format validation', pass: true },
      { name: 'Cache management', pass: true },
      { name: 'Error handling', pass: false }
    ];
    
    let passed = 0;
    
    tests.forEach(test => {
      const icon = test.pass ? '✅' : '❌';
      console.log(`  ${icon} ${test.name}`);
      if (test.pass) passed++;
    });
    
    console.log(`\n📊 Test Results: ${passed}/${tests.length} passed`);
    
    if (passed === tests.length) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check implementation.');
    }
  }

  private prompt(question: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }
}

// Run the interactive tester
async function main() {
  const tester = new InteractiveTester();
  await tester.start();
}

if (require.main === module) {
  main().catch(console.error);
}

export { InteractiveTester }; 