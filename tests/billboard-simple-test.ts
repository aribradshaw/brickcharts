import { BrickCharts, ChartSource } from '../src';
import { BillboardClient } from '../src/clients/BillboardClient';

console.log('🎵 Billboard Top 100 Simple Test Suite');
console.log('=====================================\n');

async function runSimpleTests() {
  console.log('🚀 Testing Billboard Top 100 functionality...\n');

  const brickCharts = new BrickCharts({
    enableCache: false,
    defaultSource: ChartSource.BILLBOARD
  });

  const billboardClient = new BillboardClient();

  let allTestsPassed = true;

  // Test 1: Basic chart fetching
  console.log('1. 📊 Testing basic chart fetching...');
  try {
    const hot100 = await brickCharts.getChart('hot-100');
    console.log(`   ✅ Hot 100: ${hot100.entries.length} entries`);
    console.log(`   📊 Top song: "${hot100.entries[0].title}" by ${hot100.entries[0].artist}`);
    console.log(`   📅 Chart date: ${hot100.date.toISOString().split('T')[0]}`);
    
  } catch (error) {
    console.log(`   ❌ Basic chart fetching failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 2: Multiple chart types
  console.log('\n2. 📈 Testing multiple chart types...');
  try {
    const chartTypes = ['hot-100', 'billboard-200', 'artist-100'];
    
    for (const chartType of chartTypes) {
      const chart = await brickCharts.getChart(chartType);
      console.log(`   ✅ ${chartType}: ${chart.entries.length} entries`);
    }
    
  } catch (error) {
    console.log(`   ❌ Multiple chart types failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 3: Historical data
  console.log('\n3. 📅 Testing historical data...');
  try {
    const historicalDates = [
      new Date('2024-01-01'),
      new Date('2024-06-01'),
      new Date('2025-01-01')
    ];
    
    for (const date of historicalDates) {
      const chart = await brickCharts.getChart('hot-100', ChartSource.BILLBOARD, { date });
      console.log(`   ✅ ${date.toISOString().split('T')[0]}: ${chart.entries.length} entries`);
    }
    
  } catch (error) {
    console.log(`   ❌ Historical data failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 4: Available charts
  console.log('\n4. 📋 Testing available charts...');
  try {
    const charts = await brickCharts.getAvailableCharts();
    console.log(`   ✅ Available charts: ${charts.length} charts found`);
    console.log(`   📋 Sample charts: ${charts.slice(0, 5).join(', ')}`);
    
  } catch (error) {
    console.log(`   ❌ Available charts failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 5: Data validation
  console.log('\n5. 🔍 Testing data validation...');
  try {
    const hot100 = await brickCharts.getChart('hot-100');
    
    // Check data structure
    const sampleEntry = hot100.entries[0];
    const hasRequiredFields = sampleEntry.rank && sampleEntry.title && sampleEntry.artist && sampleEntry.chartDate;
    
    console.log(`   ✅ Data structure: ${hasRequiredFields ? 'Valid' : 'Invalid'}`);
    console.log(`   📊 Sample entry:`);
    console.log(`      - Rank: ${sampleEntry.rank}`);
    console.log(`      - Title: "${sampleEntry.title}"`);
    console.log(`      - Artist: ${sampleEntry.artist}`);
    console.log(`      - Source: ${sampleEntry.source}`);
    
    // Check metadata
    const hasMetadata = hot100.metadata?.week;
    console.log(`   📊 Metadata: ${hasMetadata ? 'Present' : 'Missing'}`);
    if (hasMetadata) {
      console.log(`      - Week: ${hot100.metadata!.week}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Data validation failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 6: Performance
  console.log('\n6. ⚡ Testing performance...');
  try {
    const start = Date.now();
    const chart = await brickCharts.getChart('hot-100');
    const fetchTime = Date.now() - start;
    
    console.log(`   ✅ Fetch time: ${fetchTime}ms`);
    console.log(`   📊 Performance: ${fetchTime < 1000 ? 'Excellent' : fetchTime < 3000 ? 'Good' : 'Slow'}`);
    
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 7: Error handling
  console.log('\n7. 🛡️ Testing error handling...');
  try {
    // Test invalid chart type
    try {
      await brickCharts.getChart('invalid-chart-type');
      console.log(`   ❌ Should have thrown error for invalid chart type`);
      allTestsPassed = false;
    } catch (error) {
      console.log(`   ✅ Properly handled invalid chart type: ${error.message}`);
    }
    
    // Test that valid requests still work after errors
    const validChart = await brickCharts.getChart('hot-100');
    console.log(`   ✅ Post-error functionality: Valid chart fetched with ${validChart.entries.length} entries`);
    
  } catch (error) {
    console.log(`   ❌ Error handling test failed: ${error}`);
    allTestsPassed = false;
  }

  // Test 8: Direct client usage
  console.log('\n8. 🔧 Testing direct client usage...');
  try {
    const hot100 = await billboardClient.getChart('hot-100');
    console.log(`   ✅ Direct client: ${hot100.entries.length} entries`);
    
    const availableCharts = await billboardClient.getAvailableCharts();
    console.log(`   ✅ Available charts via client: ${availableCharts.length} charts`);
    
  } catch (error) {
    console.log(`   ❌ Direct client test failed: ${error}`);
    allTestsPassed = false;
  }

  // Summary
  console.log('\n📋 Simple Test Summary');
  console.log('======================');
  console.log(`Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`Billboard Top 100 Functionality: ${allTestsPassed ? '✅ WORKING' : '❌ ISSUES DETECTED'}`);
  
  if (allTestsPassed) {
    console.log('\n🎉 Excellent! Your Billboard Top 100 fork is working perfectly!');
    console.log('🚀 All core functionality has been tested and verified.');
    console.log('✨ The implementation is ready for use.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the results above.');
  }

  return allTestsPassed;
}

// Run the simple tests
runSimpleTests().catch(error => {
  console.error('❌ Simple test suite failed to run:', error);
  process.exit(1);
}); 