import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Clock, IndianRupee, MapPin } from 'lucide-react';
import { ComparisonChartItem } from '../../types/index.js';

interface RouteComparisonChartProps {
  data: ComparisonChartItem[];
}

export const RouteComparisonChart: React.FC<RouteComparisonChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<'time' | 'fare' | 'distance'>('time');

  if (!data || data.length === 0) return null;

  const getMetricUnit = () => {
    switch (metric) {
      case 'fare':
        return '₹';
      case 'distance':
        return ' km';
      case 'time':
      default:
        return ' mins';
    }
  };

  const getBarColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'metro':
        return '#059669'; // Emerald
      case 'train':
        return '#9333EA'; // Purple
      case 'bus (mtc)':
      case 'bus':
        return '#2563EB'; // Blue
      case 'auto':
        return '#D97706'; // Amber
      default:
        return '#3B82F6';
    }
  };

  const chartData = data.map((item) => ({
    name: item.mode,
    value:
      metric === 'fare'
        ? item.fareInr
        : metric === 'distance'
        ? item.distanceKm
        : item.timeMins,
  }));

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-slate-200 dark:border-navy-700 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Multi-Modal Comparison Chart
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare travel metrics side by side across Chennai transit options
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-navy-700 p-1 rounded-xl text-xs">
          <button
            onClick={() => setMetric('time')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition ${
              metric === 'time'
                ? 'bg-white dark:bg-navy-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time</span>
          </button>

          <button
            onClick={() => setMetric('fare')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition ${
              metric === 'fare'
                ? 'bg-white dark:bg-navy-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Fare</span>
          </button>

          <button
            onClick={() => setMetric('distance')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition ${
              metric === 'distance'
                ? 'bg-white dark:bg-navy-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Distance</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1', opacity: 0.3 }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              unit={metric === 'fare' ? '₹' : ''}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value;
                  const itemMode = payload[0].payload.name;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700">
                      <p className="font-bold text-slate-200">{itemMode}</p>
                      <p className="font-semibold text-blue-400">
                        {metric === 'fare' ? `₹${val}` : `${val}${getMetricUnit()}`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
