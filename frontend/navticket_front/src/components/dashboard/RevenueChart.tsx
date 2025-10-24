// Frontend/src/components/dashboard/RevenueChart.tsx

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts';
  
  interface RevenueChartProps {
    data: Array<{
      month: string;
      revenue: number;
    }>;
  }
  
  export const RevenueChart = ({ data }: RevenueChartProps) => {
    // If no data, show placeholder
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-400">
          Aucune donnée disponible
        </div>
      );
    }
  
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
            labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };