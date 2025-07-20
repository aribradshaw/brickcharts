import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { ChartLineProps, DEFAULT_LIGHT_THEME } from './types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export const ChartLine: React.FC<ChartLineProps> = ({
  data,
  showLabels = true,
  showPoints = true,
  smooth = false,
  fillArea = false,
  theme = DEFAULT_LIGHT_THEME,
  config = {},
  width = 800,
  height = 400,
  className = '',
  onChartClick,
  loading = false,
  error = null,
}) => {
  const chartData = useMemo(() => {
    if (!data || !data.entries) return { labels: [], datasets: [] };

    // Sort entries by rank for better visualization
    const sortedEntries = [...data.entries].sort((a, b) => a.rank - b.rank);
    
    // Create datasets for top 10 entries or tracks with trend data
    const topEntries = sortedEntries.slice(0, 10);
    
    const datasets = topEntries.map((entry, index) => {
      const color = `hsl(${(index * 360) / topEntries.length}, 70%, 50%)`;
      
      return {
        label: `${entry.title} - ${entry.artist}`,
        data: [
          {
            x: data.date,
            y: entry.rank,
          },
        ],
        borderColor: color,
        backgroundColor: fillArea ? `${color}20` : color,
        borderWidth: 2,
        pointRadius: showPoints ? 4 : 0,
        pointHoverRadius: 6,
        fill: fillArea,
        tension: smooth ? 0.4 : 0,
        metadata: entry,
      };
    });

    return {
      datasets,
    };
  }, [data, showPoints, smooth, fillArea]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: showLabels,
        labels: {
          color: theme.text,
          font: {
            size: 12,
          },
          filter: function(legendItem: any) {
            // Show only top 5 in legend to avoid clutter
            return legendItem.datasetIndex < 5;
          },
        },
      },
      title: {
        display: true,
        text: `${data.chartType} - Chart Positions`,
        color: theme.text,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: theme.background,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.grid,
        borderWidth: 1,
        callbacks: {
          title: function(context: any) {
            const entry = context[0]?.dataset?.metadata;
            return entry ? `${entry.title} - ${entry.artist}` : '';
          },
          label: function(context: any) {
            const entry = context.dataset.metadata;
            const lines = [`Rank: #${context.parsed.y}`];
            
            if (entry.lastWeek) {
              const change = entry.lastWeek - entry.rank;
              const trend = change > 0 ? '↗️' : change < 0 ? '↘️' : '➡️';
              lines.push(`${trend} Last week: #${entry.lastWeek}`);
            }
            
            if (entry.weeksOnChart) {
              lines.push(`Weeks on chart: ${entry.weeksOnChart}`);
            }
            
            if (entry.peakPosition) {
              lines.push(`Peak position: #${entry.peakPosition}`);
            }
            
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM dd',
          },
        },
        title: {
          display: true,
          text: 'Date',
          color: theme.text,
        },
        grid: {
          color: theme.grid,
        },
        ticks: {
          color: theme.text,
        },
      },
      y: {
        reverse: true, // Lower rank numbers (better positions) at top
        min: 1,
        max: Math.max(...data.entries.map(e => e.rank)) + 5,
        title: {
          display: true,
          text: 'Chart Position',
          color: theme.text,
        },
        grid: {
          color: theme.grid,
        },
        ticks: {
          color: theme.text,
          callback: function(value: any) {
            return `#${value}`;
          },
        },
      },
    },
    onClick: (_: any, elements: any) => {
      if (elements.length > 0 && onChartClick) {
        const element = elements[0];
        const entry = chartData.datasets[element.datasetIndex]?.metadata;
        if (entry) {
          onChartClick(entry);
        }
      }
    },
    ...config,
  }), [data, theme, showLabels, config, onChartClick, chartData.datasets]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading chart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-red-600">
          <div className="text-xl mb-2">⚠️</div>
          <div>Error loading chart</div>
          <div className="text-sm text-gray-500 mt-1">{error.message}</div>
        </div>
      </div>
    );
  }

  if (!data || !data.entries || data.entries.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-gray-500">
          <div className="text-xl mb-2">📊</div>
          <div>No chart data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}; 