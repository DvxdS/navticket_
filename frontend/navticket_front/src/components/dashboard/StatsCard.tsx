// Frontend/src/components/dashboard/StatsCard.tsx

import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  color?: 'blue' | 'green' | 'indigo' | 'purple' | 'orange';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'blue' 
}: StatsCardProps) => {
  const isPositive = (trend || 0) > 0;
  const showTrend = trend !== undefined && trend !== 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 mb-2">
            {value}
          </p>
          {showTrend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{Math.abs(trend)}%</span>
              <span className="text-slate-500 font-normal ml-1">
                vs mois dernier
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};