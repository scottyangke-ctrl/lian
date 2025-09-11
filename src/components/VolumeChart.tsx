// VolumeChart.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import { Chart as ChartJS } from 'chart.js';

type KlineData = [
  number, // 开盘时间
  string, // 开盘价
  string, // 最高价
  string, // 最低价
  string, // 收盘价
  string, // 成交量
  number, // 收盘时间
  string, // 成交额
  number, // 交易数
  string, // 忽略
  string, // 忽略
  string  // 忽略
];

interface VolumeChartProps {
  data: KlineData[];
  height?: number;
  title?: string;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data, height = 400, title = '成交量' }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // 创建图表
  const createChart = useCallback((ctx: CanvasRenderingContext2D, dates: string[], volumes: number[]) => {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: '成交量',
            data: volumes,
            backgroundColor: 'rgba(46, 204, 113, 0.6)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 16 }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            type: 'category',
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 10
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          }
        }
      }
    });
  }, [title]);

  // 处理数据并渲染图表
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    try {
      // 提取时间戳并转换为日期
      const timestamps = data.map(k => k[0]);
      const dates = timestamps.map(timestamp => {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.warn(`无效的时间戳: ${timestamp}`);
          return '无效时间';
        }
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      });
      
      // 提取成交量
      const volumes = data.map(k => {
        const volume = parseFloat(k[5]);
        if (isNaN(volume)) {
          console.warn(`无效的成交量: ${k[5]}`);
          return 0;
        }
        return volume;
      });
      
      // 确保canvas元素已挂载
      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          // 销毁旧图表实例
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }
          
          // 创建新图表
          chartInstance.current = createChart(ctx, dates, volumes);
        } else {
          console.error('无法获取Canvas上下文');
        }
      }
    } catch (error) {
      console.error('渲染成交量图表时出错:', error);
    }
    
    // 组件卸载时销毁图表
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, createChart]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">
          {data.length} 根K线
        </span>
      </div>
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default VolumeChart;