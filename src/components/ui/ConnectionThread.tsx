import React from 'react';
import { FileText, Cpu, GraduationCap, Building2, Sparkles } from 'lucide-react';

interface ConnectionThreadProps {
  interactive?: boolean;
  problemTitle?: string;
  universityName?: string;
  industryName?: string;
  matchScore?: number;
  className?: string;
}

export const ConnectionThread: React.FC<ConnectionThreadProps> = ({
  problemTitle = 'Groundwater Salinity in Coastal Hamlets',
  universityName = 'IIT Madras Env. Engg Lab',
  industryName = 'GreenTech Solutions Ltd.',
  matchScore = 96,
  className = '',
}) => {
  return (
    <div className={`relative bg-gradient-to-r from-[#1E2A5E]/5 via-[#3E5C9A]/10 to-[#FF6B4A]/10 p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#3E5C9A_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* 1. Problem Node */}
        <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm max-w-[200px] w-full shrink-0 group hover:border-[#1E2A5E] transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#1E2A5E]/10 border border-[#1E2A5E]/20 flex items-center justify-center text-[#1E2A5E] mb-2 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Citizen Problem</span>
          <h4 className="text-xs font-bold text-[#1E2A5E] mt-1 line-clamp-2">{problemTitle}</h4>
        </div>

        {/* 2. SVG Connection Thread (Connecting Problem to AI) */}
        <div className="hidden md:flex flex-1 items-center justify-center relative px-2">
          <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
            <defs>
              <linearGradient id="threadGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E2A5E" />
                <stop offset="100%" stopColor="#FF6B4A" />
              </linearGradient>
            </defs>
            <path
              d="M 0,12 C 30,12 70,12 100,12"
              fill="none"
              stroke="url(#threadGrad1)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-draw"
            />
            {/* Pulsing Particle */}
            <circle cx="50" cy="12" r="3.5" fill="#FF6B4A" className="animate-ping" />
          </svg>
        </div>

        {/* 3. AI Match Node (Center Brain) */}
        <div className="flex flex-col items-center text-center p-4 bg-gradient-to-b from-[#1E2A5E] to-[#162047] text-white rounded-2xl shadow-lg border border-[#3E5C9A] max-w-[190px] w-full shrink-0 relative group hover:scale-105 transition-transform">
          <div className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-[#FF6B4A] text-white text-[9px] font-extrabold uppercase tracking-wider shadow">
            {matchScore}% Fit
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#FF6B4A] my-2">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-[#FF6B4A]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Matchmaker</span>
          </div>
          <p className="text-[10px] text-slate-300 mt-1">Multi-vector Capability Alignment</p>
        </div>

        {/* 4. SVG Connection Thread (Connecting AI to Partners) */}
        <div className="hidden md:flex flex-1 items-center justify-center relative px-2">
          <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
            <defs>
              <linearGradient id="threadGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B4A" />
                <stop offset="100%" stopColor="#1F9D55" />
              </linearGradient>
            </defs>
            <path
              d="M 0,12 C 30,12 70,12 100,12"
              fill="none"
              stroke="url(#threadGrad2)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-draw"
            />
            {/* Pulsing Particle */}
            <circle cx="50" cy="12" r="3.5" fill="#1F9D55" className="animate-ping" />
          </svg>
        </div>

        {/* 5. Matched Partner Dual-Node */}
        <div className="flex flex-col gap-2 max-w-[210px] w-full shrink-0">
          
          {/* University Node */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#3E5C9A] transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#3E5C9A]/10 text-[#3E5C9A] flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">R&D Lab</span>
              <h5 className="text-[11px] font-bold text-[#1E2A5E] truncate">{universityName}</h5>
            </div>
          </div>

          {/* Industry Node */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#1F9D55] transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#1F9D55]/10 text-[#1F9D55] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Industry Sponsor</span>
              <h5 className="text-[11px] font-bold text-[#1E2A5E] truncate">{industryName}</h5>
            </div>
          </div>

        </div>

      </div>

      <div className="mt-4 text-center">
        <p className="text-[11px] text-slate-500 font-medium italic">
          "We don't just collect problems, we connect them to the exact research labs and sponsors equipped to build solutions."
        </p>
      </div>

    </div>
  );
};
