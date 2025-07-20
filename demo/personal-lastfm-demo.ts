import { BrickCharts, ChartSource } from '../src';

async function runPersonalLastFMDemo() {
  console.log('🎵 BrickCharts Demo - Personal Last.fm Charts\n');
  
  const lastfmApiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME || 'aribradshaw'; // Default username for demo
  
  if (!lastfmApiKey) {
    console.log('❌ Last.fm API key not found!');
    console.log('💡 Set the LASTFM_API_KEY environment variable to use this demo');
    console.log('💡 Set the LASTFM_USERNAME environment variable for your username');
    console.log('\nExample:');
    console.log('export LASTFM_API_KEY="your-api-key-here"');
    console.log('export LASTFM_USERNAME="your-username"');
    console.log('npm run demo:personal-lastfm');
    return;
  }

  console.log(`👤 Analyzing personal charts for: ${username}`);
  console.log('💡 Set LASTFM_USERNAME environment variable to analyze your own charts\n');

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

    // 1. Get user's top tracks (all time)
    console.log('🎵 Personal Top Tracks (All Time):');
    const personalTopTracks = await getPersonalTopTracks(lastfmApiKey, username, 10);
    personalTopTracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.title} - ${track.artist}`);
      if (track.metadata?.playcount) {
        console.log(`   🎧 ${track.metadata.playcount.toLocaleString()} plays`);
      }
      console.log('');
    });

    // 2. Get user's top artists (all time)
    console.log('🎤 Personal Top Artists (All Time):');
    const personalTopArtists = await getPersonalTopArtists(lastfmApiKey, username, 10);
    personalTopArtists.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.artist}`);
      if (artist.metadata?.playcount) {
        console.log(`   🎧 ${artist.metadata.playcount.toLocaleString()} plays`);
      }
      console.log('');
    });

    // 3. Get user's top albums (all time)
    console.log('💿 Personal Top Albums (All Time):');
    const personalTopAlbums = await getPersonalTopAlbums(lastfmApiKey, username, 10);
    personalTopAlbums.forEach((album, index) => {
      console.log(`${index + 1}. ${album.album} - ${album.artist}`);
      if (album.metadata?.playcount) {
        console.log(`   🎧 ${album.metadata.playcount.toLocaleString()} plays`);
      }
      console.log('');
    });

    // 4. Get user's recent tracks
    console.log('📅 Recent Tracks (Last 7 Days):');
    const recentTracks = await getRecentTracks(lastfmApiKey, username, 10);
    recentTracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.title} - ${track.artist}`);
      if (track.metadata?.date) {
        console.log(`   📅 ${track.metadata.date}`);
      }
      console.log('');
    });

    // 5. Get user's weekly top tracks
    console.log('📊 Weekly Top Tracks:');
    const weeklyTracks = await getWeeklyTopTracks(lastfmApiKey, username, 10);
    weeklyTracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.title} - ${track.artist}`);
      if (track.metadata?.playcount) {
        console.log(`   🎧 ${track.metadata.playcount.toLocaleString()} plays this week`);
      }
      console.log('');
    });

    // 6. Get user's monthly top tracks
    console.log('📊 Monthly Top Tracks:');
    const monthlyTracks = await getMonthlyTopTracks(lastfmApiKey, username, 10);
    monthlyTracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.title} - ${track.artist}`);
      if (track.metadata?.playcount) {
        console.log(`   🎧 ${track.metadata.playcount.toLocaleString()} plays this month`);
      }
      console.log('');
    });

    // 7. Get user's yearly top tracks
    console.log('📊 Yearly Top Tracks:');
    const yearlyTracks = await getYearlyTopTracks(lastfmApiKey, username, 10);
    yearlyTracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.title} - ${track.artist}`);
      if (track.metadata?.playcount) {
        console.log(`   🎧 ${track.metadata.playcount.toLocaleString()} plays this year`);
      }
      console.log('');
    });

    // 8. Get user's loved tracks
    console.log('❤️ Loved Tracks:');
    const lovedTracks = await getLovedTracks(lastfmApiKey, username, 10);
    lovedTracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.title} - ${track.artist}`);
      if (track.metadata?.date) {
        console.log(`   ❤️ Loved on ${track.metadata.date}`);
      }
      console.log('');
    });

    console.log('\n✅ Personal Last.fm Demo completed successfully!');
    console.log('\n🎯 Personal Music Analysis Features:');
    console.log('- ✅ All-time top tracks, artists, and albums');
    console.log('- ✅ Recent listening activity');
    console.log('- ✅ Time-period analysis (weekly, monthly, yearly)');
    console.log('- ✅ Loved tracks collection');
    console.log('- ✅ Play count statistics');
    console.log('- ✅ Listening history insights');

  } catch (error) {
    console.error('❌ Personal Last.fm Demo failed:', error);
    
    if (error.message?.includes('API key')) {
      console.log('\n💡 Tip: Make sure your Last.fm API key is valid.');
    } else if (error.message?.includes('User not found')) {
      console.log('\n💡 Tip: Check the username or try with a different Last.fm username.');
    } else if (error.message?.includes('ENOTFOUND')) {
      console.log('\n💡 Tip: Check your internet connection.');
    }
  }
}

// Helper functions for personal Last.fm data
async function getPersonalTopTracks(apiKey: string, username: string, limit: number = 50) {
  const axios = require('axios');
  const params = {
    method: 'user.gettoptracks',
    api_key: apiKey,
    format: 'json',
    user: username,
    limit: limit.toString(),
    period: 'overall'
  };

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });
  const tracks = response.data.toptracks?.track || [];

  return tracks.map((track: any, index: number) => ({
    rank: index + 1,
    title: track.name,
    artist: track.artist.name,
    chartDate: new Date(),
    source: ChartSource.LASTFM,
    metadata: {
      playcount: parseInt(track.playcount || '0'),
      mbid: track.artist.mbid
    }
  }));
}

async function getPersonalTopArtists(apiKey: string, username: string, limit: number = 50) {
  const axios = require('axios');
  const params = {
    method: 'user.gettopartists',
    api_key: apiKey,
    format: 'json',
    user: username,
    limit: limit.toString(),
    period: 'overall'
  };

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });
  const artists = response.data.topartists?.artist || [];

  return artists.map((artist: any, index: number) => ({
    rank: index + 1,
    title: artist.name,
    artist: artist.name,
    chartDate: new Date(),
    source: ChartSource.LASTFM,
    metadata: {
      playcount: parseInt(artist.playcount || '0'),
      mbid: artist.mbid
    }
  }));
}

async function getPersonalTopAlbums(apiKey: string, username: string, limit: number = 50) {
  const axios = require('axios');
  const params = {
    method: 'user.gettopalbums',
    api_key: apiKey,
    format: 'json',
    user: username,
    limit: limit.toString(),
    period: 'overall'
  };

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });
  const albums = response.data.topalbums?.album || [];

  return albums.map((album: any, index: number) => ({
    rank: index + 1,
    title: album.name,
    artist: album.artist.name,
    album: album.name,
    chartDate: new Date(),
    source: ChartSource.LASTFM,
    metadata: {
      playcount: parseInt(album.playcount || '0'),
      mbid: album.artist.mbid
    }
  }));
}

async function getRecentTracks(apiKey: string, username: string, limit: number = 50) {
  const axios = require('axios');
  const params = {
    method: 'user.getrecenttracks',
    api_key: apiKey,
    format: 'json',
    user: username,
    limit: limit.toString()
  };

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });
  const tracks = response.data.recenttracks?.track || [];

  return tracks.map((track: any, index: number) => ({
    rank: index + 1,
    title: track.name,
    artist: track.artist['#text'],
    chartDate: new Date(),
    source: ChartSource.LASTFM,
    metadata: {
      date: track.date?.['#text'],
      album: track.album['#text'],
      mbid: track.mbid
    }
  }));
}

async function getWeeklyTopTracks(apiKey: string, username: string, limit: number = 50) {
  const axios = require('axios');
  const params = {
    method: 'user.gettoptracks',
    api_key: apiKey,
    format: 'json',
    user: username,
    limit: limit.toString(),
    period: '7day'
  };

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });
  const tracks = response.data.toptracks?.track || [];

  return tracks.map((track: any, index: number) => ({
    rank: index + 1,
    title: track.name,
    artist: track.artist.name,
    chartDate: new Date(),
    source: ChartSource.LASTFM,
    metadata: {
      playcount: parseInt(track.playcount || '0'),
      mbid: track.artist.mbid
    }
  }));
}

async function getMonthlyTopTracks(apiKey: string, username: string, limit: number = 50) {
  const axios = require('axios');
  const params = {
    method: 'user.gettoptracks',
    api_key: apiKey,
    format: 'json',
    user: username,
    limit: limit.toString(),
    period: '1month'
  };

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });
  const tracks = response.data.toptracks?.track || [];

  return tracks.map((track: any, index: number) => ({
    rank: index + 1,
    title: track.name,
    artist: track.artist.name,
    chartDate: new Date(),
    source: ChartSource.LASTFM,
    metadata: {
      playcount: parseInt(track.playcount || '0'),
      mbid: track.artist.mbid
    }
  }));
}

async function getYearlyTopTracks(apiKey: string, username: string, limit: number = 50) {
  const axios = require('axios');
  const params = {
    method: 'user.gettoptracks',
    api_key: apiKey,
    format: 'json',
    user: username,
    limit: limit.toString(),
    period: '12month'
  };

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });
  const tracks = response.data.toptracks?.track || [];

  return tracks.map((track: any, index: number) => ({
    rank: index + 1,
    title: track.name,
    artist: track.artist.name,
    chartDate: new Date(),
    source: ChartSource.LASTFM,
    metadata: {
      playcount: parseInt(track.playcount || '0'),
      mbid: track.artist.mbid
    }
  }));
}

async function getLovedTracks(apiKey: string, username: string, limit: number = 50) {
  const axios = require('axios');
  const params = {
    method: 'user.getlovedtracks',
    api_key: apiKey,
    format: 'json',
    user: username,
    limit: limit.toString()
  };

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });
  const tracks = response.data.lovedtracks?.track || [];

  return tracks.map((track: any, index: number) => ({
    rank: index + 1,
    title: track.name,
    artist: track.artist.name,
    chartDate: new Date(),
    source: ChartSource.LASTFM,
    metadata: {
      date: track.date?.['#text'],
      mbid: track.mbid
    }
  }));
}

// Run the personal Last.fm demo
runPersonalLastFMDemo().catch(console.error); 