import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DonutChartProps {
  data: Array<{ category: string; count: number; color: string }>;
  height?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 280,
}) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div style={{ width: '100%', height }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="count"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(30, 42, 94, 0.08)',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${value} Problems (${Math.round((Number(value) / (total || 1)) * 100)}%)`, 'Count']}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
            iconType="circle"
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      
      {/* Center Stat */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
        <span className="text-2xl font-extrabold text-[#1E2A5E] font-mono-data">{total}</span>
        <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
      </div>
    </div>
  );
};
