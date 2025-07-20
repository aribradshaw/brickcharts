import { BrickCharts, ChartSource } from '../src';

async function runCombinedDemo() {
  console.log('🎵 BrickCharts Demo - Billboard + Last.fm Integration\n');
  
  const lastfmApiKey = process.env.LASTFM_API_KEY;
  
  // Initialize BrickCharts with both services
  const brickCharts = new BrickCharts({
    enableCache: true,
    defaultSource: ChartSource.BILLBOARD,
    apiKeys: {
      lastfm: lastfmApiKey
    },
    cacheOptions: {
      ttl: 1000 * 60 * 30, // 30 minutes
      maxSize: 100,
      persistent: true
    }
  });

  try {
    console.log('🔍 Testing multi-source health...');
    const health = await brickCharts.healthCheck();
    console.log('Service status:', Object.fromEntries(health));
    console.log('');

    // 1. Show all available charts from both sources
    console.log('📊 Available Charts Across All Sources:');
    
    const billboardCharts = await brickCharts.getAvailableCharts(ChartSource.BILLBOARD);
    console.log(`\n🎼 Billboard Charts (${billboardCharts.length}):`);
    billboardCharts.slice(0, 5).forEach((chart, index) => {
      console.log(`  ${index + 1}. ${chart}`);
    });
    if (billboardCharts.length > 5) {
      console.log(`  ... and ${billboardCharts.length - 5} more`);
    }

    if (lastfmApiKey) {
      const lastfmCharts = await brickCharts.getAvailableCharts(ChartSource.LASTFM);
      console.log(`\n🌐 Last.fm Charts (${lastfmCharts.length}):`);
      lastfmCharts.forEach((chart, index) => {
        console.log(`  ${index + 1}. ${chart}`);
      });
    } else {
      console.log('\n🌐 Last.fm Charts: (API key required)');
    }
    console.log('');

    // 2. Cross-platform music discovery
    console.log('🎵 Cross-Platform Top Tracks Analysis:');
    
    const billboardTop5 = await brickCharts.getChart('hot-100', ChartSource.BILLBOARD, { limit: 5 });
    console.log('\n📊 Billboard Hot 100 Top 5:');
    billboardTop5.entries.forEach(entry => {
      console.log(`  ${entry.rank}. ${entry.title} - ${entry.artist}`);
      if (entry.weeksOnChart) {
        console.log(`     📅 ${entry.weeksOnChart} weeks on chart`);
      }
    });

    if (lastfmApiKey) {
      const lastfmTop5 = await brickCharts.getChart('top-tracks', ChartSource.LASTFM, { limit: 5 });
      console.log('\n🌐 Last.fm Global Top 5:');
      lastfmTop5.entries.forEach(entry => {
        console.log(`  ${entry.rank}. ${entry.title} - ${entry.artist}`);
        if (entry.metadata?.playcount) {
          console.log(`     🎧 ${entry.metadata.playcount.toLocaleString()} plays`);
        }
      });

      // Find overlaps
      const findCommonTracks = (billboard: any[], lastfm: any[]) => {
        const billboardSet = new Set(billboard.map(e => 
          `${e.title.toLowerCase().trim()} - ${e.artist.toLowerCase().trim()}`
        ));
        return lastfm.filter(entry =>
          billboardSet.has(`${entry.title.toLowerCase().trim()} - ${entry.artist.toLowerCase().trim()}`)
        );
      };

      const commonTracks = findCommonTracks(billboardTop5.entries, lastfmTop5.entries);
      
      if (commonTracks.length > 0) {
        console.log('\n🎯 Tracks Popular on Both Platforms:');
        commonTracks.forEach(track => {
          console.log(`  ✅ ${track.title} - ${track.artist}`);
        });
      } else {
        console.log('\n📈 Different Top 5s - Shows unique discovery patterns!');
      }
    }

    // 3. Genre-specific analysis
    console.log('\n🎼 Genre-Specific Charts:');
    
    try {
      const countryChart = await brickCharts.getChart('country-songs', ChartSource.BILLBOARD, { limit: 3 });
      console.log('\n🤠 Billboard Country Top 3:');
      countryChart.entries.forEach(entry => {
        console.log(`  ${entry.rank}. ${entry.title} - ${entry.artist}`);
      });
    } catch (error) {
      console.log('\n🤠 Country charts temporarily unavailable');
    }

    try {
      const rapChart = await brickCharts.getChart('rap-songs', ChartSource.BILLBOARD, { limit: 3 });
      console.log('\n🎤 Billboard Rap Top 3:');
      rapChart.entries.forEach(entry => {
        console.log(`  ${entry.rank}. ${entry.title} - ${entry.artist}`);
      });
    } catch (error) {
      console.log('\n🎤 Rap charts temporarily unavailable');
    }

    // 4. Time-based analysis with Last.fm
    if (lastfmApiKey) {
      console.log('\n📅 Time-Based Music Trends (Last.fm):');
      
      try {
        const weeklyTracks = await brickCharts.getChart('top-tracks-weekly', ChartSource.LASTFM, { limit: 3 });
        console.log('\n📊 This Week\'s Global Favorites:');
        weeklyTracks.entries.forEach(entry => {
          console.log(`  ${entry.rank}. ${entry.title} - ${entry.artist}`);
        });

        const yearlyTracks = await brickCharts.getChart('top-tracks-yearly', ChartSource.LASTFM, { limit: 3 });
        console.log('\n📊 This Year\'s Global Favorites:');
        yearlyTracks.entries.forEach(entry => {
          console.log(`  ${entry.rank}. ${entry.title} - ${entry.artist}`);
        });
      } catch (error) {
        console.log('Time-based analysis skipped (API limitations)');
      }
    }

    // 5. Performance and caching insights
    console.log('\n⚡ Performance Insights:');
    const cacheStats = await brickCharts.getCacheStats();
    console.log('Cache performance:', cacheStats);
    
    console.log('\n✅ Combined Demo completed successfully!');
    console.log('\n🎯 Unified Music Intelligence Platform:');
    console.log('- ✅ Billboard commercial chart tracking');
    console.log('- ✅ Last.fm global listening data');
    console.log('- ✅ Cross-platform trend analysis');
    console.log('- ✅ Genre-specific insights');
    console.log('- ✅ Time-based pattern recognition');
    console.log('- ✅ Intelligent caching and performance');
    
    if (!lastfmApiKey) {
      console.log('\n💡 Get a Last.fm API key for full functionality:');
      console.log('   https://www.last.fm/api/account/create');
    }

  } catch (error) {
    console.error('❌ Combined Demo failed:', error);
  }
}

// Run the combined demo
runCombinedDemo().catch(console.error); 