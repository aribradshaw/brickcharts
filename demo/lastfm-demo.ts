import { BrickCharts, ChartSource } from '../src';

async function runLastFMDemo() {
  console.log('🎵 BrickCharts Demo - Last.fm Integration\n');
  
  // Get Last.fm API key from environment or prompt
  const lastfmApiKey = process.env.LASTFM_API_KEY;
  
  if (!lastfmApiKey) {
    console.log('❌ Last.fm API key not found!');
    console.log('💡 Get a free API key from: https://www.last.fm/api/account/create');
    console.log('💡 Set the LASTFM_API_KEY environment variable to use this demo');
    console.log('\nExample:');
    console.log('export LASTFM_API_KEY="your-api-key-here"');
    console.log('npm run demo:lastfm');
    return;
  }

  // Initialize BrickCharts with Last.fm integration
  const brickCharts = new BrickCharts({
    enableCache: true,
    defaultSource: ChartSource.LASTFM,
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
    console.log('🔍 Testing service health...');
    const health = await brickCharts.healthCheck();
    console.log('Health status:', Object.fromEntries(health));
    console.log('');

    // 1. Show available Last.fm charts
    console.log('📊 Available Last.fm Charts:');
    const lastfmCharts = await brickCharts.getAvailableCharts(ChartSource.LASTFM);
    lastfmCharts.forEach((chart, index) => {
      console.log(`${index + 1}. ${chart}`);
    });
    console.log('');

    // 2. Get Last.fm Top Tracks (Global)
    console.log('🎵 Last.fm Global Top Tracks:');
    const topTracks = await brickCharts.getChart('top-tracks', ChartSource.LASTFM, { limit: 10 });
    topTracks.entries.forEach(entry => {
      console.log(`${entry.rank}. ${entry.title} - ${entry.artist}`);
      if (entry.metadata?.playcount) {
        console.log(`   🎧 ${entry.metadata.playcount.toLocaleString()} plays`);
      }
      if (entry.metadata?.listeners) {
        console.log(`   👥 ${entry.metadata.listeners.toLocaleString()} listeners`);
      }
      console.log('');
    });

    // 3. Get Last.fm Top Albums
    console.log('💿 Last.fm Global Top Albums:');
    const topAlbums = await brickCharts.getChart('top-albums', ChartSource.LASTFM, { limit: 5 });
    topAlbums.entries.forEach(entry => {
      console.log(`${entry.rank}. ${entry.album} - ${entry.artist}`);
      if (entry.metadata?.playcount) {
        console.log(`   🎧 ${entry.metadata.playcount.toLocaleString()} plays`);
      }
      console.log('');
    });

    // 4. Get Last.fm Top Artists
    console.log('🎤 Last.fm Global Top Artists:');
    const topArtists = await brickCharts.getChart('top-artists', ChartSource.LASTFM, { limit: 5 });
    topArtists.entries.forEach(entry => {
      console.log(`${entry.rank}. ${entry.artist}`);
      if (entry.metadata?.playcount) {
        console.log(`   🎧 ${entry.metadata.playcount.toLocaleString()} plays`);
      }
      if (entry.metadata?.listeners) {
        console.log(`   👥 ${entry.metadata.listeners.toLocaleString()} listeners`);
      }
      console.log('');
    });

    // 5. Weekly charts
    console.log('📅 Last.fm Weekly Top Tracks:');
    const weeklyTracks = await brickCharts.getChart('top-tracks-weekly', ChartSource.LASTFM, { limit: 5 });
    weeklyTracks.entries.forEach(entry => {
      console.log(`${entry.rank}. ${entry.title} - ${entry.artist}`);
      if (entry.metadata?.playcount) {
        console.log(`   🎧 ${entry.metadata.playcount.toLocaleString()} plays this week`);
      }
      console.log('');
    });

    // 6. Cache statistics
    console.log('💾 Cache Statistics:');
    const cacheStats = await brickCharts.getCacheStats();
    console.log(cacheStats);

    console.log('\n✅ Last.fm Demo completed successfully!');
    console.log('\n🎯 Key Last.fm Features Demonstrated:');
    console.log('- ✅ Global music charts (tracks, albums, artists)');
    console.log('- ✅ Time-period specific charts (weekly, monthly, yearly)');
    console.log('- ✅ Play count and listener statistics');
    console.log('- ✅ Unified API with Billboard integration');
    console.log('- ✅ Intelligent caching system');

  } catch (error) {
    console.error('❌ Last.fm Demo failed:', error);
    
    if (error.message?.includes('API key')) {
      console.log('\n💡 Tip: Make sure your Last.fm API key is valid.');
      console.log('💡 Get one from: https://www.last.fm/api/account/create');
    } else if (error.message?.includes('ENOTFOUND')) {
      console.log('\n💡 Tip: Check your internet connection.');
    }
  }
}

// Run the Last.fm demo
runLastFMDemo().catch(console.error); 