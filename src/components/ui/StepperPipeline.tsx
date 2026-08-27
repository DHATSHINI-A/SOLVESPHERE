import React from 'react';
import { 
  FileText, 
  Cpu, 
  Users, 
  Kanban, 
  Wrench, 
  Rocket, 
  Award,
  Check
} from 'lucide-react';

export type PipelineStage = 
  | 'submit' 
  | 'analysis' 
  | 'matching' 
  | 'workspace' 
  | 'build' 
  | 'deployment' 
  | 'impact';

interface StepperPipelineProps {
  currentStage: PipelineStage | string;
  onStageClick?: (stage: PipelineStage) => void;
  className?: string;
}

const steps: { id: PipelineStage; label: string; subLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'submit', label: 'Submit Problem', subLabel: 'Citizen / NGO', icon: FileText },
  { id: 'analysis', label: 'AI Analysis', subLabel: 'Skills Extraction', icon: Cpu },
  { id: 'matching', label: 'Partner Match', subLabel: 'Univ + Industry', icon: Users },
  { id: 'workspace', label: 'Collaboration', subLabel: 'R&D Taskforce', icon: Kanban },
  { id: 'build', label: 'Solution Build', subLabel: 'TRL 1–9 Milestones', icon: Wrench },
  { id: 'deployment', label: 'Deployment', subLabel: 'Field Execution', icon: Rocket },
  { id: 'impact', label: 'Impact Tracking', subLabel: 'Live Telemetry', icon: Award },
];

const stageOrder: Record<string, number> = {
  submit: 0,
  new: 0,
  verified: 1,
  analysis: 1,
  matched: 2,
  matching: 2,
  workspace: 3,
  'in collaboration': 3,
  build: 4,
  'prototype development': 4,
  'prototype ready': 4,
  deployment: 5,
  deployed: 5,
  live: 5,
  impact: 6,
};

export const StepperPipeline: React.FC<StepperPipelineProps> = ({
  currentStage,
  onStageClick,
  className = '',
}) => {
  const currentIndex = stageOrder[currentStage?.toLowerCase()] ?? 0;

  return (
    <div className={`w-full overflow-x-auto py-2 scrollbar-hide ${className}`}>
      <div className="flex items-center min-w-[720px] justify-between relative px-2">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-slate-200 -z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-6 -translate-y-1/2 h-[2px] bg-[#1E2A5E] -z-0 transition-all duration-500 ease-in-out" 
          style={{ width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - 24px)` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              onClick={() => onStageClick && onStageClick(step.id)}
              className={`flex flex-col items-center relative z-10 group ${
                onStageClick ? 'cursor-pointer' : ''
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#1E2A5E] text-white ring-4 ring-[#1E2A5E]/15'
                    : isCurrent
                    ? 'bg-[#FF6B4A] text-white ring-4 ring-[#FF6B4A]/25 scale-110 shadow-md animate-pulse-subtle'
                    : 'bg-white text-slate-400 border-2 border-slate-300 group-hover:border-[#3E5C9A]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>

              {/* Step Label */}
              <div className="text-center mt-2">
                <p
                  className={`text-xs font-semibold whitespace-nowrap leading-none ${
                    isCurrent
                      ? 'text-[#FF6B4A] font-bold'
                      : isCompleted
                      ? 'text-[#1E2A5E]'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                  {step.subLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
