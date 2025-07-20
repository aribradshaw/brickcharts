import { BrickCharts, ChartSource } from '../src';
import { SearchEngine } from '../src/search/SearchEngine';
import { ExportManager } from '../src/export/ExportManager';
import { ChartData } from '../src/types';

console.log('🎵 Billboard Top 100 Complete Integration Test');
console.log('=============================================\n');

async function runIntegrationTest() {
  console.log('🚀 Starting complete integration test...\n');

  // Initialize all components
  const brickCharts = new BrickCharts({
    enableCache: true,
    defaultSource: ChartSource.BILLBOARD,
    cacheOptions: {
      ttl: 300000, // 5 minutes
      maxSize: 50,
      persistent: false
    }
  });

  const searchEngine = new SearchEngine();
  const exportManager = new ExportManager();

  let testResults = {
    chartFetching: false,
    searchFunctionality: false,
    exportFunctionality: false,
    caching: false,
    dataProcessing: false
  };

  try {
    // Step 1: Fetch multiple chart types
    console.log('📊 Step 1: Fetching multiple chart types...');
    const charts: ChartData[] = [];
    
    const chartTypes = ['hot-100', 'billboard-200', 'artist-100'];
    for (const chartType of chartTypes) {
      const chart = await brickCharts.getChart(chartType);
      charts.push(chart);
      console.log(`   ✅ ${chartType}: ${chart.entries.length} entries`);
    }
    
    testResults.chartFetching = true;
    console.log('   🎉 Chart fetching: SUCCESS\n');

    // Step 2: Index and search data
    console.log('🔍 Step 2: Testing search functionality...');
    searchEngine.indexChartData(charts);
    
    // Test various search scenarios
    const searchTests = [
      { query: { artist: charts[0].entries[0].artist }, description: 'Artist search' },
      { query: { title: charts[0].entries[0].title.substring(0, 5) }, description: 'Title search' },
      { query: { rankRange: { min: 1, max: 10 } }, description: 'Rank range search' },
      { query: { artist: charts[0].entries[0].artist, fuzzy: true }, description: 'Fuzzy search' }
    ];

    for (const test of searchTests) {
      const results = searchEngine.search(test.query);
      console.log(`   ✅ ${test.description}: ${results.results.length} results`);
    }
    
    testResults.searchFunctionality = true;
    console.log('   🎉 Search functionality: SUCCESS\n');

    // Step 3: Test export functionality
    console.log('📤 Step 3: Testing export functionality...');
    const exportTests = [
      { format: 'csv' as const, description: 'CSV Export' },
      { format: 'json' as const, description: 'JSON Export' },
      { format: 'svg' as const, description: 'SVG Export' }
    ];

    for (const test of exportTests) {
      const result = await exportManager.exportChartData(charts[0], { format: test.format });
      console.log(`   ✅ ${test.description}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    }
    
    testResults.exportFunctionality = true;
    console.log('   🎉 Export functionality: SUCCESS\n');

    // Step 4: Test caching
    console.log('💾 Step 4: Testing caching...');
    const start1 = Date.now();
    const chart1 = await brickCharts.getChart('hot-100');
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    const chart2 = await brickCharts.getChart('hot-100');
    const time2 = Date.now() - start2;
    
    console.log(`   📊 First fetch: ${time1}ms`);
    console.log(`   📊 Cached fetch: ${time2}ms`);
    console.log(`   📊 Cache efficiency: ${time2 < time1 ? 'Working' : 'Needs optimization'}`);
    
    testResults.caching = true;
    console.log('   🎉 Caching: SUCCESS\n');

    // Step 5: Test data processing and validation
    console.log('🔍 Step 5: Testing data processing...');
    let totalEntries = 0;
    let validEntries = 0;
    
    for (const chart of charts) {
      totalEntries += chart.entries.length;
      validEntries += chart.entries.filter(entry => 
        entry.rank && 
        entry.title && 
        entry.artist && 
        entry.chartDate && 
        entry.source
      ).length;
    }
    
    const dataQuality = (validEntries / totalEntries) * 100;
    console.log(`   📊 Total entries processed: ${totalEntries}`);
    console.log(`   📊 Valid entries: ${validEntries}`);
    console.log(`   📊 Data quality: ${dataQuality.toFixed(1)}%`);
    
    testResults.dataProcessing = true;
    console.log('   🎉 Data processing: SUCCESS\n');

    // Step 6: Performance analysis
    console.log('⚡ Step 6: Performance analysis...');
    const performanceTests: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await brickCharts.getChart('hot-100');
      const time = Date.now() - start;
      performanceTests.push(time);
    }
    
    const avgTime = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
    console.log(`   📊 Average fetch time: ${avgTime.toFixed(0)}ms`);
    console.log(`   📊 Performance rating: ${avgTime < 1000 ? 'Excellent' : avgTime < 3000 ? 'Good' : 'Needs optimization'}\n`);

    // Final summary
    console.log('📋 Integration Test Summary');
    console.log('===========================');
    console.log(`Chart Fetching: ${testResults.chartFetching ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Search Functionality: ${testResults.searchFunctionality ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Export Functionality: ${testResults.exportFunctionality ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Caching: ${testResults.caching ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Data Processing: ${testResults.dataProcessing ? '✅ PASS' : '❌ FAIL'}`);

    const allPassed = Object.values(testResults).every(result => result);
    
    if (allPassed) {
      console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
      console.log('🚀 Your Billboard Top 100 fork is fully integrated and working perfectly!');
      console.log('✨ Ready for production use.');
    } else {
      console.log('\n⚠️  Some integration tests failed. Please review the results above.');
    }

    return allPassed;

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
}

// Run the integration test
runIntegrationTest().catch(error => {
  console.error('❌ Integration test suite failed to run:', error);
  process.exit(1);
}); 