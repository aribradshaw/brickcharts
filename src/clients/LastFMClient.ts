import axios, { AxiosResponse } from 'axios';
import { 
  ChartClient, 
  ChartData, 
  ChartEntry,
  ChartSource, 
  FetchOptions, 
  DateRange, 
  HistoricalChartData,
  APIError,
  LastFMTrack,
  LastFMChart
} from '../types';

export interface LastFMAlbum {
  name: string;
  artist: {
    name: string;
    mbid?: string;
  };
  playcount: string;
  rank: string;
  '@attr'?: {
    rank: string;
  };
}

export interface LastFMArtist {
  name: string;
  playcount: string;
  listeners: string;
  rank: string;
  '@attr'?: {
    rank: string;
  };
}

export interface LastFMResponse<T> {
  [key: string]: {
    track?: T[];
    album?: T[];
    artist?: T[];
    '@attr': {
      from?: string;
      to?: string;
      page: string;
      perPage: string;
      total: string;
      totalPages: string;
    };
  };
}

export class LastFMClient implements ChartClient {
  public readonly name = 'Last.FM';
  public readonly source = ChartSource.LASTFM;
  private readonly baseUrl = 'https://ws.audioscrobbler.com/2.0/';
  
  private readonly chartMap = new Map<string, { method: string; period?: string }>([
    ['top-tracks', { method: 'chart.gettoptracks' }],
    ['top-albums', { method: 'chart.gettopalbums' }],
    ['top-artists', { method: 'chart.gettopartists' }],
    ['top-tracks-weekly', { method: 'chart.gettoptracks', period: '7day' }],
    ['top-tracks-monthly', { method: 'chart.gettoptracks', period: '1month' }],
    ['top-tracks-yearly', { method: 'chart.gettoptracks', period: '12month' }],
    ['top-albums-weekly', { method: 'chart.gettopalbums', period: '7day' }],
    ['top-albums-monthly', { method: 'chart.gettopalbums', period: '1month' }],
    ['top-albums-yearly', { method: 'chart.gettopalbums', period: '12month' }],
    ['top-artists-weekly', { method: 'chart.gettopartists', period: '7day' }],
    ['top-artists-monthly', { method: 'chart.gettopartists', period: '1month' }],
    ['top-artists-yearly', { method: 'chart.gettopartists', period: '12month' }]
  ]);
  
  constructor(private readonly apiKey: string) {
    if (!this.apiKey) {
      console.warn('LastFM API key not provided - Last.FM features will be unavailable');
    }
  }

  async getAvailableCharts(): Promise<string[]> {
    return Array.from(this.chartMap.keys());
  }

  async getChart(type: string, options: FetchOptions = {}): Promise<ChartData> {
    if (!this.apiKey) {
      throw new APIError(
        'Last.FM API key is required',
        401,
        ChartSource.LASTFM
      );
    }

    const chartConfig = this.chartMap.get(type);
    if (!chartConfig) {
      throw new APIError(
        `Unknown chart type: ${type}`,
        400,
        ChartSource.LASTFM
      );
    }

    try {
      const params = {
        method: chartConfig.method,
        api_key: this.apiKey,
        format: 'json',
        limit: (options.limit || 50).toString(),
        page: '1'
      };

      const response: AxiosResponse<LastFMResponse<LastFMTrack | LastFMAlbum | LastFMArtist>> = 
        await axios.get(this.baseUrl, { params });

      return this.transformToChartData(response.data, type, options.date || new Date());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        throw new APIError(
          `Last.FM API error: ${message}`,
          status,
          ChartSource.LASTFM
        );
      }
      throw new APIError(
        `Failed to fetch Last.FM chart: ${error}`,
        500,
        ChartSource.LASTFM
      );
    }
  }

  async getHistoricalData(type: string, dateRange: DateRange): Promise<HistoricalChartData> {
    // Last.fm doesn't provide historical chart data in the same way as Billboard
    // We can simulate this by getting current data and noting the limitation
    const currentData = await this.getChart(type, { date: dateRange.end });
    
    return {
      chartType: type,
      dateRange,
      data: [currentData],
      source: ChartSource.LASTFM
    };
  }

  /**
   * Search for tracks by artist or title
   */
  async searchTracks(query: string, limit: number = 50): Promise<ChartEntry[]> {
    if (!this.apiKey) {
      throw new APIError(
        'Last.FM API key is required',
        401,
        ChartSource.LASTFM
      );
    }

    try {
      const params = {
        method: 'track.search',
        api_key: this.apiKey,
        format: 'json',
        track: query,
        limit: limit.toString()
      };

      const response = await axios.get(this.baseUrl, { params });
      const searchResults = response.data.results?.trackmatches?.track || [];

      return searchResults.map((track: any, index: number) => ({
        rank: index + 1,
        title: track.name,
        artist: track.artist,
        chartDate: new Date(),
        source: ChartSource.LASTFM,
        metadata: {
          listeners: track.listeners,
          url: track.url,
          mbid: track.mbid
        }
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        throw new APIError(
          `Last.FM search error: ${message}`,
          status,
          ChartSource.LASTFM
        );
      }
      throw new APIError(
        `Failed to search Last.FM: ${error}`,
        500,
        ChartSource.LASTFM
      );
    }
  }

  /**
   * Get track info including play count and tags
   */
  async getTrackInfo(artist: string, track: string): Promise<any> {
    if (!this.apiKey) {
      throw new APIError(
        'Last.FM API key is required',
        401,
        ChartSource.LASTFM
      );
    }

    try {
      const params = {
        method: 'track.getInfo',
        api_key: this.apiKey,
        format: 'json',
        artist,
        track
      };

      const response = await axios.get(this.baseUrl, { params });
      return response.data.track;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        throw new APIError(
          `Last.FM track info error: ${message}`,
          status,
          ChartSource.LASTFM
        );
      }
      throw new APIError(
        `Failed to get track info from Last.FM: ${error}`,
        500,
        ChartSource.LASTFM
      );
    }
  }

  private transformToChartData(data: LastFMResponse<any>, chartType: string, date: Date): ChartData {
    const responseKey = Object.keys(data)[0];
    const chartData = data[responseKey];
    
    let entries: ChartEntry[] = [];
    
    if (chartData.track) {
      entries = this.transformTracks(chartData.track, date);
    } else if (chartData.album) {
      entries = this.transformAlbums(chartData.album, date);
    } else if (chartData.artist) {
      entries = this.transformArtists(chartData.artist, date);
    }

    return {
      chartType,
      date,
      entries,
      source: ChartSource.LASTFM,
      totalEntries: entries.length,
      metadata: {
        period: this.chartMap.get(chartType)?.period || 'overall',
        total: chartData['@attr']?.total,
        page: chartData['@attr']?.page
      }
    };
  }

  private transformTracks(tracks: LastFMTrack[], date: Date): ChartEntry[] {
    return tracks.map((track, index) => ({
      rank: parseInt(track['@attr']?.rank || track.rank || (index + 1).toString()),
      title: track.name,
      artist: track.artist.name,
      chartDate: date,
      source: ChartSource.LASTFM,
      metadata: {
        playcount: parseInt(track.playcount || '0'),
        listeners: parseInt(track.listeners || '0'),
        mbid: track.artist.mbid
      }
    }));
  }

  private transformAlbums(albums: LastFMAlbum[], date: Date): ChartEntry[] {
    return albums.map((album, index) => ({
      rank: parseInt(album['@attr']?.rank || album.rank || (index + 1).toString()),
      title: album.name,
      artist: album.artist.name,
      album: album.name,
      chartDate: date,
      source: ChartSource.LASTFM,
      metadata: {
        playcount: parseInt(album.playcount || '0'),
        mbid: album.artist.mbid
      }
    }));
  }

  private transformArtists(artists: LastFMArtist[], date: Date): ChartEntry[] {
    return artists.map((artist, index) => ({
      rank: parseInt(artist['@attr']?.rank || artist.rank || (index + 1).toString()),
      title: artist.name, // For artists, we use name as title
      artist: artist.name,
      chartDate: date,
      source: ChartSource.LASTFM,
      metadata: {
        playcount: parseInt(artist.playcount || '0'),
        listeners: parseInt(artist.listeners || '0')
      }
    }));
  }
} 