import { 
  ChartClient, 
  ChartData, 
  ChartSource, 
  FetchOptions, 
  DateRange, 
  HistoricalChartData,
  APIError
} from '../types';

export class LastFMClient implements ChartClient {
  public readonly name = 'Last.FM';
  public readonly source = ChartSource.LASTFM;
  
  constructor(private readonly apiKey: string) {
    // Store API key for future Last.FM implementation
    if (!this.apiKey) {
      console.warn('LastFM API key not provided - Last.FM features will be unavailable');
    }
  }

  async getAvailableCharts(): Promise<string[]> {
    // TODO: Implement Last.FM chart types
    return [
      'top-tracks',
      'top-albums', 
      'top-artists'
    ];
  }

  async getChart(_type: string, _options: FetchOptions = {}): Promise<ChartData> {
    // TODO: Implement Last.FM API integration
    throw new APIError(
      'Last.FM integration not yet implemented',
      501,
      ChartSource.LASTFM
    );
  }

  async getHistoricalData(_type: string, _dateRange: DateRange): Promise<HistoricalChartData> {
    // TODO: Implement Last.FM historical data
    throw new APIError(
      'Last.FM historical data not yet implemented',
      501,
      ChartSource.LASTFM
    );
  }
} 