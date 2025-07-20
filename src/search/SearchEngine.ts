import { ChartData, ChartEntry, ChartSource } from '../types';
import { createEntryHash } from '../utils';

export interface SearchQuery {
  title?: string;
  artist?: string;
  album?: string;
  chartType?: string;
  source?: ChartSource;
  dateRange?: {
    start: Date;
    end: Date;
  };
  rankRange?: {
    min: number;
    max: number;
  };
  weeksRange?: {
    min: number;
    max: number;
  };
  peakRange?: {
    min: number;
    max: number;
  };
  newEntriesOnly?: boolean;
  fuzzy?: boolean;
  limit?: number;
}

export interface SearchResult {
  entry: ChartEntry;
  chartData: ChartData;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: 'title' | 'artist' | 'album';
  value: string;
  matchType: 'exact' | 'partial' | 'fuzzy';
  confidence: number;
}

export interface SearchStats {
  totalResults: number;
  searchTime: number;
  chartsSearched: number;
  exactMatches: number;
  partialMatches: number;
  fuzzyMatches: number;
}

export class SearchEngine {
  private searchIndex: Map<string, ChartEntry[]> = new Map();
  private chartDataCache: Map<string, ChartData> = new Map();

  /**
   * Index chart data for faster searching
   */
  indexChartData(chartData: ChartData[]): void {
    chartData.forEach(chart => {
      const chartKey = `${chart.source}-${chart.chartType}-${chart.date.toISOString()}`;
      this.chartDataCache.set(chartKey, chart);

      chart.entries.forEach(entry => {
        // Index by various fields
        this.addToIndex('title', entry.title.toLowerCase(), entry);
        this.addToIndex('artist', entry.artist.toLowerCase(), entry);
        if (entry.album) {
          this.addToIndex('album', entry.album.toLowerCase(), entry);
        }
        
        // Index by combined fields
        this.addToIndex('full', `${entry.title} ${entry.artist}`.toLowerCase(), entry);
      });
    });
  }

  /**
   * Enhanced search with fuzzy matching and ranking
   */
  search(query: SearchQuery): { results: SearchResult[]; stats: SearchStats } {
    const startTime = Date.now();
    const results: SearchResult[] = [];
    const chartsSearched = new Set<string>();
    let exactMatches = 0;
    let partialMatches = 0;
    let fuzzyMatches = 0;

    // Get all relevant chart data
    const relevantCharts = this.getRelevantCharts(query);
    
    relevantCharts.forEach(chart => {
      chartsSearched.add(`${chart.source}-${chart.chartType}`);
      
      chart.entries.forEach(entry => {
        const searchResult = this.scoreEntry(entry, chart, query);
        if (searchResult && searchResult.score > 0) {
          results.push(searchResult);
          
          // Update match type counts
          const hasExact = searchResult.matches.some(m => m.matchType === 'exact');
          const hasPartial = searchResult.matches.some(m => m.matchType === 'partial');
          const hasFuzzy = searchResult.matches.some(m => m.matchType === 'fuzzy');
          
          if (hasExact) exactMatches++;
          else if (hasPartial) partialMatches++;
          else if (hasFuzzy) fuzzyMatches++;
        }
      });
    });

    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);

    // Apply limit
    const limitedResults = query.limit ? results.slice(0, query.limit) : results;

    const searchTime = Date.now() - startTime;
    const stats: SearchStats = {
      totalResults: limitedResults.length,
      searchTime,
      chartsSearched: chartsSearched.size,
      exactMatches,
      partialMatches,
      fuzzyMatches
    };

    return { results: limitedResults, stats };
  }

  /**
   * Quick search for autocomplete
   */
  quickSearch(term: string, field: 'title' | 'artist' | 'album' = 'title', limit = 10): string[] {
    const suggestions = new Set<string>();
    const lowerTerm = term.toLowerCase();

    for (const [key, entries] of this.searchIndex) {
      if (key.startsWith(`${field}:`) && key.includes(lowerTerm)) {
        entries.forEach(entry => {
          const value = field === 'title' ? entry.title : 
                       field === 'artist' ? entry.artist : 
                       entry.album || '';
          if (value.toLowerCase().includes(lowerTerm)) {
            suggestions.add(value);
          }
        });
      }
      
      if (suggestions.size >= limit) break;
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Search for similar entries
   */
  findSimilar(entry: ChartEntry, limit = 10): SearchResult[] {
    const query: SearchQuery = {
      artist: entry.artist,
      fuzzy: true,
      limit: limit + 1 // +1 to exclude the original entry
    };

    const { results } = this.search(query);
    
    // Filter out the original entry
    return results.filter(result => 
      createEntryHash(result.entry) !== createEntryHash(entry)
    ).slice(0, limit);
  }

  /**
   * Get trending searches (placeholder for future implementation)
   */
  getTrendingSearches(): string[] {
    // TODO: Implement based on search history
    return [
      'Taylor Swift',
      'Drake',
      'Morgan Wallen',
      'Bad Bunny',
      'Olivia Rodrigo'
    ];
  }

  /**
   * Clear search index
   */
  clearIndex(): void {
    this.searchIndex.clear();
    this.chartDataCache.clear();
  }

  /**
   * Add entry to search index
   */
  private addToIndex(field: string, value: string, entry: ChartEntry): void {
    const key = `${field}:${value}`;
    if (!this.searchIndex.has(key)) {
      this.searchIndex.set(key, []);
    }
    this.searchIndex.get(key)!.push(entry);
  }

  /**
   * Get charts relevant to search query
   */
  private getRelevantCharts(query: SearchQuery): ChartData[] {
    const charts: ChartData[] = [];
    
    for (const [, chart] of this.chartDataCache) {
      // Filter by source
      if (query.source && chart.source !== query.source) continue;
      
      // Filter by chart type
      if (query.chartType && chart.chartType !== query.chartType) continue;
      
      // Filter by date range
      if (query.dateRange) {
        if (chart.date < query.dateRange.start || chart.date > query.dateRange.end) {
          continue;
        }
      }
      
      charts.push(chart);
    }
    
    return charts;
  }

  /**
   * Score an entry against search query
   */
  private scoreEntry(entry: ChartEntry, chart: ChartData, query: SearchQuery): SearchResult | null {
    let score = 0;
    const matches: SearchMatch[] = [];

    // Apply filters first
    if (query.rankRange) {
      if (entry.rank < query.rankRange.min || entry.rank > query.rankRange.max) {
        return null;
      }
    }

    if (query.weeksRange && entry.weeksOnChart) {
      if (entry.weeksOnChart < query.weeksRange.min || entry.weeksOnChart > query.weeksRange.max) {
        return null;
      }
    }

    if (query.peakRange && entry.peakPosition) {
      if (entry.peakPosition < query.peakRange.min || entry.peakPosition > query.peakRange.max) {
        return null;
      }
    }

    if (query.newEntriesOnly && entry.lastWeek) {
      return null; // Not a new entry
    }

    // Text matching
    if (query.title) {
      const match = this.matchText(entry.title, query.title, query.fuzzy);
      if (match) {
        score += match.confidence * 3; // Title matches are weighted higher
        matches.push({ field: 'title', value: entry.title, ...match });
      } else if (!query.fuzzy) {
        return null; // Strict matching failed
      }
    }

    if (query.artist) {
      const match = this.matchText(entry.artist, query.artist, query.fuzzy);
      if (match) {
        score += match.confidence * 2; // Artist matches are weighted medium
        matches.push({ field: 'artist', value: entry.artist, ...match });
      } else if (!query.fuzzy && !query.title) {
        return null; // Strict matching failed
      }
    }

    if (query.album && entry.album) {
      const match = this.matchText(entry.album, query.album, query.fuzzy);
      if (match) {
        score += match.confidence * 1; // Album matches are weighted lower
        matches.push({ field: 'album', value: entry.album, ...match });
      }
    }

    // Boost score based on chart position (higher ranks get lower scores)
    score += (101 - entry.rank) / 100;

    // Boost newer entries
    const daysSinceChart = (new Date().getTime() - chart.date.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, (30 - daysSinceChart) / 30);

    if (score === 0 && matches.length === 0) {
      return null;
    }

    return {
      entry,
      chartData: chart,
      score,
      matches
    };
  }

  /**
   * Match text with different strategies
   */
  private matchText(text: string, query: string, fuzzy = false): {
    matchType: 'exact' | 'partial' | 'fuzzy';
    confidence: number;
  } | null {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match
    if (lowerText === lowerQuery) {
      return { matchType: 'exact', confidence: 1.0 };
    }

    // Partial match
    if (lowerText.includes(lowerQuery)) {
      const confidence = lowerQuery.length / lowerText.length;
      return { matchType: 'partial', confidence };
    }

    // Fuzzy match (simple implementation)
    if (fuzzy) {
      const similarity = this.calculateSimilarity(lowerText, lowerQuery);
      if (similarity > 0.6) {
        return { matchType: 'fuzzy', confidence: similarity };
      }
    }

    return null;
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  }
} 