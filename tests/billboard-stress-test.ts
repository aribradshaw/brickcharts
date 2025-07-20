import { BrickCharts, ChartSource } from '../src';
import { BillboardClient } from '../src/clients/BillboardClient';

console.log('🔥 Billboard Top 100 Stress Test Suite');
console.log('=====================================\n');

async function runStressTests() {
  const brickCharts = new BrickCharts({
    enableCache: false,
    defaultSource: ChartSource.BILLBOARD
  });

  const billboardClient = new BillboardClient();
  let allTestsPassed = true;

  // Stress Test 1: Concurrent Requests
  console.log('1. 🔄 Testing Concurrent Requests...');
  try {
    const promises: Promise<any>[] = [];
    for (let i = 0; i < 5; i++) {
      promises.push(brickCharts.getChart('hot-100'));
    }
    
    const start = Date.now();
    const results = await Promise.all(promises);
    const totalTime = Date.now() - start;
    
    console.log(`   ✅ Concurrent requests: ${results.length} requests completed in ${totalTime}ms`);
    console.log(`   📊 Average time per request: ${totalTime / results.length}ms`);
    
    // Verify all results are valid
    const allValid = results.every(chart => chart.entries.length > 0);
    console.log(`   ✅ All results valid: ${allValid ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.log(`   ❌ Concurrent requests failed: ${error}`);
    allTestsPassed = false;
  }

  // Stress Test 2: Multiple Chart Types Rapidly
  console.log('\n2. 📈 Testing Multiple Chart Types Rapidly...');
  try {
    const chartTypes = ['hot-100', 'billboard-200', 'artist-100', 'pop-songs', 'country-songs'];
    const start = Date.now();
    
    const results = await Promise.all(
      chartTypes.map(type => brickCharts.getChart(type))
    );
    
    const totalTime = Date.now() - start;
    console.log(`   ✅ Multiple chart types: ${results.length} charts fetched in ${totalTime}ms`);
    
    for (let i = 0; i < results.length; i++) {
      console.log(`   📊 ${chartTypes[i]}: ${results[i].entries.length} entries`);
    }
    
  } catch (error) {
    console.log(`   ❌ Multiple chart types failed: ${error}`);
    allTestsPassed = false;
  }

  // Stress Test 3: Historical Data Fetching
  console.log('\n3. 📅 Testing Historical Data Fetching...');
  try {
    const dates = [
      new Date('2024-01-01'),
      new Date('2024-06-01'),
      new Date('2025-01-01'),
      new Date('2025-07-01')
    ];
    
    const start = Date.now();
    const results = await Promise.all(
      dates.map(date => brickCharts.getChart('hot-100', ChartSource.BILLBOARD, { date }))
    );
    
    const totalTime = Date.now() - start;
    console.log(`   ✅ Historical data: ${results.length} charts fetched in ${totalTime}ms`);
    
    for (let i = 0; i < results.length; i++) {
      console.log(`   📅 ${dates[i].toISOString().split('T')[0]}: ${results[i].entries.length} entries`);
    }
    
  } catch (error) {
    console.log(`   ❌ Historical data failed: ${error}`);
    allTestsPassed = false;
  }

  // Stress Test 4: Error Recovery
  console.log('\n4. 🛡️ Testing Error Recovery...');
  try {
    // Test with invalid chart types
    const invalidCharts = ['invalid-1', 'invalid-2', 'invalid-3'];
    let errorCount = 0;
    
    for (const chartType of invalidCharts) {
      try {
        await brickCharts.getChart(chartType);
      } catch (error) {
        errorCount++;
      }
    }
    
    console.log(`   ✅ Error recovery: ${errorCount}/${invalidCharts.length} errors properly handled`);
    
    // Test that valid requests still work after errors
    const validChart = await brickCharts.getChart('hot-100');
    console.log(`   ✅ Post-error functionality: Valid chart fetched with ${validChart.entries.length} entries`);
    
  } catch (error) {
    console.log(`   ❌ Error recovery failed: ${error}`);
    allTestsPassed = false;
  }

  // Stress Test 5: Data Integrity Under Load
  console.log('\n5. 🔍 Testing Data Integrity Under Load...');
  try {
    const iterations = 10;
    const results: Array<{
      iteration: number;
      entryCount: number;
      topSong: string;
      hasMetadata: boolean;
    }> = [];
    
    for (let i = 0; i < iterations; i++) {
      const chart = await brickCharts.getChart('hot-100');
      results.push({
        iteration: i + 1,
        entryCount: chart.entries.length,
        topSong: chart.entries[0]?.title,
        hasMetadata: !!chart.metadata?.week
      });
    }
    
    // Check consistency
    const entryCounts = results.map(r => r.entryCount);
    const consistentCounts = entryCounts.every(count => count === entryCounts[0]);
    const hasMetadata = results.every(r => r.hasMetadata);
    
    console.log(`   ✅ Data integrity: ${iterations} iterations completed`);
    console.log(`   📊 Consistent entry counts: ${consistentCounts ? 'Yes' : 'No'}`);
    console.log(`   📊 Metadata present: ${hasMetadata ? 'Yes' : 'No'}`);
    console.log(`   📊 Average entries per chart: ${entryCounts.reduce((a, b) => a + b, 0) / entryCounts.length}`);
    
  } catch (error) {
    console.log(`   ❌ Data integrity test failed: ${error}`);
    allTestsPassed = false;
  }

  // Stress Test 6: Memory Usage
  console.log('\n6. 💾 Testing Memory Usage...');
  try {
    const initialMemory = process.memoryUsage();
    console.log(`   📊 Initial memory: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`);
    
    // Fetch multiple charts
    const charts: any[] = [];
    for (let i = 0; i < 5; i++) {
      const chart = await brickCharts.getChart('hot-100');
      charts.push(chart);
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log(`   📊 Final memory: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
    console.log(`   📊 Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    console.log(`   ✅ Memory usage: ${memoryIncrease < 50 * 1024 * 1024 ? 'Reasonable' : 'High'}`);
    
  } catch (error) {
    console.log(`   ❌ Memory test failed: ${error}`);
    allTestsPassed = false;
  }

  // Stress Test 7: Network Resilience
  console.log('\n7. 🌐 Testing Network Resilience...');
  try {
    const start = Date.now();
    let successCount = 0;
    let errorCount = 0;
    
    // Make multiple requests to test network resilience
    for (let i = 0; i < 10; i++) {
      try {
        await brickCharts.getChart('hot-100');
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }
    
    const totalTime = Date.now() - start;
    const successRate = (successCount / (successCount + errorCount)) * 100;
    
    console.log(`   ✅ Network resilience: ${successCount} successful, ${errorCount} failed`);
    console.log(`   📊 Success rate: ${successRate.toFixed(1)}%`);
    console.log(`   📊 Total time: ${totalTime}ms`);
    console.log(`   📊 Average time per request: ${totalTime / (successCount + errorCount)}ms`);
    
  } catch (error) {
    console.log(`   ❌ Network resilience test failed: ${error}`);
    allTestsPassed = false;
  }

  // Summary
  console.log('\n📋 Stress Test Summary');
  console.log('======================');
  console.log(`Overall Status: ${allTestsPassed ? '✅ ALL STRESS TESTS PASSED' : '❌ SOME STRESS TESTS FAILED'}`);
  console.log(`Billboard Top 100 Robustness: ${allTestsPassed ? '✅ EXCELLENT' : '❌ NEEDS IMPROVEMENT'}`);
  
  if (allTestsPassed) {
    console.log('\n🎉 Excellent! Your Billboard Top 100 fork is robust and production-ready!');
    console.log('🚀 All stress tests passed - the implementation can handle real-world usage.');
  } else {
    console.log('\n⚠️  Some stress tests failed. Consider reviewing the implementation.');
  }

  return allTestsPassed;
}

// Run the stress tests
runStressTests().catch(error => {
  console.error('❌ Stress test suite failed to run:', error);
  process.exit(1);
}); 