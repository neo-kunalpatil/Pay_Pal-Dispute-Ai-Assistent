import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
  badgeLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-[#0070BA]',
  onClick,
  badgeLabel
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#E5EAF0] p-4 lg:p-5 shadow-xs transition-all duration-200 flex items-center justify-between gap-3 ${
        onClick ? 'cursor-pointer hover:border-[#0070BA]/40 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span>{title}</span>
            {badgeLabel && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {badgeLabel}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#172B4D] tracking-tight">{value}</span>
            {change && (
              <span
                className={`inline-flex items-center text-xs font-semibold ${
                  isPositive ? 'text-emerald-600' : 'text-slate-600'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
