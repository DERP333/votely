import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#14b8a6'  // Teal
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-200 mb-1">{data.name}</p>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-indigo-400">{data.votes} votes</span>
          <span className="text-xs text-slate-400">({data.percentage}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

const VoteChart = ({ options = [], totalVotes = 0 }) => {
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'

  const chartData = options.map((opt, idx) => ({
    name: opt.text,
    votes: opt.votes || 0,
    percentage: totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0,
    color: COLORS[idx % COLORS.length]
  }));

  if (options.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        No voting data available yet.
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      {/* Chart Header & Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-bold text-slate-200">Vote Analytics</h4>
          <p className="text-xs text-slate-400">Total votes counted: <strong className="text-indigo-400">{totalVotes}</strong></p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              chartType === 'bar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              chartType === 'pie'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Pie Chart</span>
          </button>
        </div>
      </div>

      {/* Interactive Visualization */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#cbd5e1' }}
                width={120}
                tickFormatter={(val) => (val.length > 18 ? `${val.substring(0, 18)}...` : val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="votes"
                radius={[0, 8, 8, 0]}
                fill="#6366f1"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="votes"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={45}
                paddingAngle={4}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Percentage Breakdown List */}
      <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium truncate max-w-[70%]">{item.name}</span>
              <span className="text-slate-400 font-mono">
                <strong className="text-slate-200">{item.votes}</strong> votes ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoteChart;

