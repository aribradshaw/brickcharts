/**
 * BrickCharts - Billboard and Last.FM Charts Library
 * 
 * Copyright (c) 2025 Brickstone Studios LLC
 * Author: Ari Daniel Bradshaw
 * 
 * Licensed under the MIT License
 */

// Core library exports
export * from './types'
export * from './clients'
export * from './data'
export * from './utils'

// Main BrickCharts class
export { BrickCharts } from './core/BrickCharts'

// Chart data sources
export { BillboardClient } from './clients/BillboardClient'
export { LastFMClient } from './clients/LastFMClient'

// Data management
export { ChartDataManager } from './data/ChartDataManager'
export { ChartCache } from './data/ChartCache'

// Search functionality
export { SearchEngine } from './search/SearchEngine'
export type { SearchQuery, SearchResult, SearchMatch, SearchStats } from './search/SearchEngine'

// Export functionality
export { ExportManager } from './export/ExportManager'
export type { ExportFormat, ExportOptions, ExportResult } from './export/ExportManager'

// Component types (for React users)
export type { ChartComponentProps, ChartTheme, ChartConfig } from './components/types'

// Utilities
export { normalizeChartData, formatDate, calculateTrends } from './utils' 