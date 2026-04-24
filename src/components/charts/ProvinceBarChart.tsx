import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const data = [
  { province: 'Lusaka', count: 850 },
  { province: 'Copperbelt', count: 720 },
  { province: 'Southern', count: 450 },
  { province: 'Central', count: 320 },
  { province: 'Eastern', count: 280 },
  { province: 'Western', count: 150 },
  { province: 'Northern', count: 180 },
  { province: 'Luapula', count: 140 },
  { province: 'North-W.', count: 130 },
  { province: 'Muchinga', count: 110 },
];

export const ProvinceBarChart: React.FC = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%" debounce={1}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="province" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
          />
          <Tooltip 
             contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
            }} 
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#006B3F' : '#32de84'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
