import React from 'react';
import { ArrowDown } from 'lucide-react';

interface FunnelStep {
  stage: string;
  count: number;
  color: string;
}

interface FunnelChartProps {
  data: FunnelStep[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  const maxCount = data[0]?.count || 1;

  return (
    <div className="w-full space-y-2.5 py-2">
      {data.map((step, idx) => {
        const widthPct = Math.max(18, Math.round((step.count / maxCount) * 100));
        const conversionFromTop = Math.round((step.count / maxCount) * 100);
        const prevStep = data[idx - 1];
        const stepConversion = prevStep ? Math.round((step.count / (prevStep.count || 1)) * 100) : 100;

        return (
          <div key={step.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: step.color }} />
                {step.stage}
              </span>
              <div className="flex items-center gap-3">
                {idx > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono-data">
                    {stepConversion}% from previous
                  </span>
                )}
                <span className="font-bold font-mono-data text-[#1E2A5E]">
                  {step.count.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Funnel Horizontal Bar */}
            <div className="w-full bg-slate-100 h-7 rounded-lg overflow-hidden flex items-center px-2 relative">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end px-3 shadow-xs"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: step.color,
                }}
              >
                <span className="text-[11px] font-bold text-white font-mono-data drop-shadow-xs">
                  {conversionFromTop}%
                </span>
              </div>
            </div>

            {idx < data.length - 1 && (
              <div className="flex justify-center -my-1 text-slate-300">
                <ArrowDown className="w-3 h-3" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
