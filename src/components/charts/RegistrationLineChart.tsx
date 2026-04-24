import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Apr 01', count: 45 },
  { name: 'Apr 05', count: 52 },
  { name: 'Apr 10', count: 48 },
  { name: 'Apr 15', count: 61 },
  { name: 'Apr 20', count: 55 },
  { name: 'Apr 25', count: 67 },
  { name: 'Apr 30', count: 72 },
];

export const RegistrationLineChart: React.FC = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%" debounce={1}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#006B3F" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#006B3F', strokeWidth: 2, stroke: '#fff' }} 
            activeDot={{ r: 6, strokeWidth: 0 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
