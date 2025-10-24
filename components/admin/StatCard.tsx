import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  };

  const selectedColor = colorClasses[color];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-6 hover:shadow-lg transition-shadow duration-300">
      <div className={`p-4 rounded-full ${selectedColor.bg}`}>
        <div className={`w-8 h-8 ${selectedColor.text}`}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {trend && (
          <div className="flex items-center mt-1 text-sm">
            <span className={`font-semibold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '▲' : '▼'} {trend.value}%
            </span>
            <span className="text-gray-400 ml-2">no último mês</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;