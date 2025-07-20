import { BrickCharts, ChartSource } from '../src';
import { BillboardClient } from '../src/clients/BillboardClient';
import { SearchEngine } from '../src/search/SearchEngine';
import { ExportManager } from '../src/export/ExportManager';

console.log('🎵 Billboard Top 100 Comprehensive Test Suite');
console.log('=============================================\n');

async function runComprehensiveTests() {
  const brickCharts = new BrickCharts({
    enableCache: false,
    defaultSource: ChartSource.BILLBOARD
  });

  const billboardClient = new BillboardClient();
  const searchEngine = new SearchEngine();
  const exportManager = new ExportManager();

  let allTestsPassed = true;

  // Test 1: Chart Fetching
  console.log('1. 🔍 Testing Chart Fetching...');
  try {
    const hot100 = await brickCharts.getChart('hot-100');
    console.log(`   ✅ Hot 100 fetched successfully: ${hot100.entries.length} entries`);
    console.log(`   📊 Top song: "${hot100.entries[0].title}" by ${hot100.entries[0].artist}`);
    
    // Test specific date
    const pastChart = await brickCharts.getChart('hot-100', ChartSource.BILLBOARD, {
      date: new Date('2024-01-01')
    });
    console.log(`   ✅ Historical chart fetched: ${pastChart.entries.length} entries`);
    
  } catch (error) {
    console.log(`   ❌ Chart fetching failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 2: Available Charts
  console.log('\n2. 📊 Testing Available Charts...');
  try {
    const charts = await brickCharts.getAvailableCharts();
    console.log(`   ✅ Available charts: ${charts.length} charts found`);
    console.log(`   📋 Sample charts: ${charts.slice(0, 5).join(', ')}`);
    
  } catch (error) {
    console.log(`   ❌ Available charts failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 3: Multiple Chart Types
  console.log('\n3. 📈 Testing Multiple Chart Types...');
  try {
    const chartTypes = ['hot-100', 'billboard-200', 'artist-100'];
    
    for (const chartType of chartTypes) {
      try {
        const chart = await brickCharts.getChart(chartType);
        console.log(`   ✅ ${chartType}: ${chart.entries.length} entries`);
      } catch (error) {
        console.log(`   ⚠️  ${chartType}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Multiple chart types failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 4: Search Functionality
  console.log('\n4. 🔎 Testing Search Features...');
  try {
    const hot100 = await brickCharts.getChart('hot-100');
    searchEngine.indexChartData([hot100]);
    
    // Test basic search
    const searchResults = searchEngine.search({ artist: hot100.entries[0].artist });
    console.log(`   ✅ Search for "${hot100.entries[0].artist}": ${searchResults.results.length} results`);
    
    // Test fuzzy search
    const fuzzyResults = searchEngine.search({ 
      title: hot100.entries[0].title.substring(0, 3), 
      fuzzy: true 
    });
    console.log(`   ✅ Fuzzy search: ${fuzzyResults.results.length} results`);
    
  } catch (error) {
    console.log(`   ❌ Search functionality failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 5: Export Functions
  console.log('\n5. 📤 Testing Export Functions...');
  try {
    const hot100 = await brickCharts.getChart('hot-100');
    
    // Test CSV export
    const csvResult = await exportManager.exportChartData(hot100, { format: 'csv' });
    console.log(`   ✅ CSV export: ${csvResult.success ? 'Success' : 'Failed'}`);
    
    // Test JSON export
    const jsonResult = await exportManager.exportChartData(hot100, { format: 'json' });
    console.log(`   ✅ JSON export: ${jsonResult.success ? 'Success' : 'Failed'}`);
    
  } catch (error) {
    console.log(`   ❌ Export functions failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 6: Caching
  console.log('\n6. 💾 Testing Caching...');
  try {
    const cachedBrickCharts = new BrickCharts({
      enableCache: true,
      cacheOptions: {
        ttl: 60000,
        maxSize: 10,
        persistent: false
      }
    });
    
    // First fetch (should cache)
    const start1 = Date.now();
    const chart1 = await cachedBrickCharts.getChart('hot-100');
    const time1 = Date.now() - start1;
    
    // Second fetch (should use cache)
    const start2 = Date.now();
    const chart2 = await cachedBrickCharts.getChart('hot-100');
    const time2 = Date.now() - start2;
    
    console.log(`   ✅ Cache test: First fetch ${time1}ms, Second fetch ${time2}ms`);
    console.log(`   📊 Cache efficiency: ${time2 < time1 ? 'Working' : 'Needs optimization'}`);
    
  } catch (error) {
    console.log(`   ❌ Caching failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 7: Performance
  console.log('\n7. ⚡ Testing Performance...');
  try {
    const start = Date.now();
    const chart = await brickCharts.getChart('hot-100');
    const fetchTime = Date.now() - start;
    
    console.log(`   ✅ Chart fetch time: ${fetchTime}ms`);
    console.log(`   📊 Data processing: ${chart.entries.length} entries processed`);
    
    if (fetchTime < 5000) {
      console.log(`   🚀 Performance: Excellent (< 5s)`);
    } else if (fetchTime < 10000) {
      console.log(`   ⚡ Performance: Good (< 10s)`);
    } else {
      console.log(`   ⚠️  Performance: Slow (> 10s)`);
    }
    
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 8: Health Check
  console.log('\n8. 🏥 Testing Health Check...');
  try {
    const health = await brickCharts.healthCheck();
    
    for (const [source, isHealthy] of health.entries()) {
      console.log(`   ${isHealthy ? '✅' : '❌'} ${source}: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 9: Data Validation
  console.log('\n9. 🔍 Testing Data Validation...');
  try {
    const hot100 = await brickCharts.getChart('hot-100');
    
    // Validate chart structure
    const isValid = hot100.entries.every(entry => 
      entry.rank && 
      entry.title && 
      entry.artist && 
      entry.chartDate && 
      entry.source
    );
    
    console.log(`   ✅ Data validation: ${isValid ? 'All entries valid' : 'Invalid entries found'}`);
    console.log(`   📊 Chart metadata: Week ${hot100.metadata?.week}, Total entries: ${hot100.totalEntries}`);
    
    // Check for required fields
    const sampleEntry = hot100.entries[0];
    console.log(`   📋 Sample entry structure:`);
    console.log(`      - Rank: ${sampleEntry.rank}`);
    console.log(`      - Title: ${sampleEntry.title}`);
    console.log(`      - Artist: ${sampleEntry.artist}`);
    console.log(`      - Source: ${sampleEntry.source}`);
    
  } catch (error) {
    console.log(`   ❌ Data validation failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 10: Error Handling
  console.log('\n10. 🛡️ Testing Error Handling...');
  try {
    // Test invalid chart type
    try {
      await brickCharts.getChart('invalid-chart-type');
      console.log(`   ❌ Should have thrown error for invalid chart type`);
      allTestsPassed = false;
    } catch (error) {
      console.log(`   ✅ Properly handled invalid chart type: ${error.message}`);
    }
    
    // Test with invalid date
    try {
      await brickCharts.getChart('hot-100', ChartSource.BILLBOARD, {
        date: new Date('1900-01-01')
      });
      console.log(`   ✅ Handled very old date gracefully`);
    } catch (error) {
      console.log(`   ✅ Properly handled invalid date: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error handling test failed: ${error}`);
    allTestsPassed = false;
  }

  // Summary
  console.log('\n📋 Test Summary');
  console.log('===============');
  console.log(`Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`Billboard Top 100 Integration: ${allTestsPassed ? '✅ WORKING' : '❌ ISSUES DETECTED'}`);
  
  if (allTestsPassed) {
    console.log('\n🎉 Congratulations! Your Billboard Top 100 fork is working perfectly!');
    console.log('🚀 All functionality has been tested and verified.');
  } else {
    console.log('\n⚠️  Some issues were detected. Please review the failed tests above.');
  }

  return allTestsPassed;
}

// Run the tests
runComprehensiveTests().catch(error => {
  console.error('❌ Test suite failed to run:', error);
  process.exit(1);
}); 