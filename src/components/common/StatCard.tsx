import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
  accent?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  onClick,
  accent = false,
}) => (
  <div
    onClick={onClick}
    className={`civic-card p-5 relative overflow-hidden transition-all duration-200 group ${
      onClick ? 'cursor-pointer civic-card-interactive' : ''
    } ${accent ? 'border-l-4 border-l-[#FF6B4A]' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-mono-data tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {subtitle && (
          <p className="text-xs text-[#6B7280] font-medium pt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
          accent
            ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/20'
            : 'bg-[#1E2A5E]/10 text-[#1E2A5E] border border-[#1E2A5E]/15'
        }`}
      >
        {icon}
      </div>
    </div>

    {trend && trendValue && (
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center font-bold">
          {trend === 'up' && (
            <span className="flex items-center text-[#1F9D55] bg-[#1F9D55]/10 px-1.5 py-0.5 rounded text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {trendValue}
            </span>
          )}
          {trend === 'down' && (
            <span className="flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trendValue}
            </span>
          )}
          {trend === 'neutral' && (
            <span className="flex items-center text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              {trendValue}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#6B7280]">vs past quarter</span>
      </div>
    )}
  </div>
);
