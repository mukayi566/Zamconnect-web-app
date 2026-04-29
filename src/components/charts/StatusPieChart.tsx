import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';

interface StatusPieChartProps {
  data?: { name: string; value: number; color: string }[];
}

const defaultData = [
  { name: 'Active', value: 0, color: '#15803D' },
  { name: 'Pending', value: 0, color: '#A16207' },
  { name: 'Suspended', value: 0, color: '#DC2626' },
  { name: 'Rejected', value: 0, color: '#B91C1C' },
];

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ data = defaultData }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%" debounce={1}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
            }} 
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
