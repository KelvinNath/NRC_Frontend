import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Decimation,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Decimation
);

interface BarChartData {
  [key: string]: string | number;
}

interface BarChartComponentProps {
  data: BarChartData[];
  dataKeys: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  xAxisKey: string;
  title: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  className?: string;
  maxDataPoints?: number;
  showValues?: boolean;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  data,
  dataKeys,
  xAxisKey,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  className = '',
  maxDataPoints = 100,
  showValues = false
}) => {
  // Optimize data for large datasets
  const optimizedData = useMemo(() => {
    if (data.length <= maxDataPoints) return data;
    
    // Sample data for large datasets to maintain performance
    const step = Math.ceil(data.length / maxDataPoints);
    return data.filter((_, index) => index % step === 0);
  }, [data, maxDataPoints]);

  const chartData = useMemo(() => ({
    labels: optimizedData.map(item => {
      const value = item[xAxisKey];
      if (typeof value === 'string') {
        // Truncate long strings
        return value.length > 15 ? value.substring(0, 15) + '...' : value;
      }
      return value;
    }),
    datasets: dataKeys.map(({ key, color, name }) => ({
      label: name,
      data: optimizedData.map(item => item[key] as number),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
      stack: stacked ? 'stack' : undefined,
      // Performance optimizations
      barThickness: 'flex' as const,
      maxBarThickness: 50,
      minBarLength: 2,
    })),
  }), [optimizedData, dataKeys, xAxisKey, stacked]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          },
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset: any, index: number) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              lineWidth: 3,
              pointStyle: 'rect',
              hidden: !chart.isDatasetVisible(index),
              index: index,
            }));
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (tooltipItems: any[]) => {
            return `${xAxisKey}: ${tooltipItems[0].label}`;
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      },
      decimation: {
        enabled: true,
        algorithm: 'min-max' as const,
        samples: 50,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 10
          },
          maxTicksLimit: 15, // Limit x-axis labels for large datasets
        },
        title: {
          display: true,
          text: xAxisKey.charAt(0).toUpperCase() + xAxisKey.slice(1),
          font: {
            size: 12,
            weight: '600'
          },
          color: '#374151'
        }
      },
      y: {
        display: true,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        beginAtZero: true,
        stacked: stacked,
        ticks: {
          font: {
            size: 10
          },
          callback: (value: any) => {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Count / Quantity',
          font: {
            size: 12,
            weight: '600'
          },
          color: '#374151'
        }
      },
    },
    elements: {
      bar: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
      },
    },
    animation: {
      duration: optimizedData.length > 200 ? 0 : 1000, // Disable animation for large datasets
    },
    responsiveAnimationDuration: 0,
  }), [showGrid, showLegend, stacked, xAxisKey, optimizedData.length]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        {data.length > maxDataPoints && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Showing {optimizedData.length.toLocaleString()} of {data.length.toLocaleString()} data points
          </div>
        )}
      </div>
      <div style={{ height: height }} className="relative">
        <Bar data={chartData} options={options} />
        {optimizedData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>No data available</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarChartComponent; 