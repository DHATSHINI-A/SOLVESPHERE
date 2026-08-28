import React from 'react';
import type { ProblemStatus, UrgencyLevel } from '../../types';

const categoryColors: Record<string, string> = {
  'Water':              'bg-blue-50 text-[#1E2A5E] border-blue-200',
  'Water & Sanitation': 'bg-blue-50 text-[#1E2A5E] border-blue-200',
  'Agriculture':        'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Clean Energy':       'bg-amber-50 text-amber-800 border-amber-200',
  'Energy':             'bg-amber-50 text-amber-800 border-amber-200',
  'Smart Cities':       'bg-indigo-50 text-indigo-800 border-indigo-200',
  'Waste Management':   'bg-orange-50 text-orange-800 border-orange-200',
  'Waste':              'bg-orange-50 text-orange-800 border-orange-200',
  'Healthcare':         'bg-rose-50 text-rose-800 border-rose-200',
  'Health':             'bg-rose-50 text-rose-800 border-rose-200',
  'EdTech':             'bg-sky-50 text-sky-800 border-sky-200',
  'Education':          'bg-sky-50 text-sky-800 border-sky-200',
  'Cybersecurity':      'bg-slate-100 text-slate-800 border-slate-200',
  'Disaster Management':'bg-red-50 text-red-800 border-red-200',
};

export const CategoryBadge: React.FC<{ category?: string; sector?: string }> = ({ category, sector }) => {
  const label = category || sector || 'General';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryColors[label] ?? 'bg-slate-100 text-slate-800 border-slate-200'}`}>
      {label}
    </span>
  );
};

export const SectorBadge = CategoryBadge;

const statusConfig: Record<string, { label: string; style: string }> = {
  'new':                   { label: 'New Problem',        style: 'bg-slate-100 text-slate-700 border-slate-200' },
  'draft':                 { label: 'Draft',              style: 'bg-slate-100 text-slate-600 border-slate-200' },
  'pending review':        { label: 'Pending Review',     style: 'bg-amber-50 text-amber-800 border-amber-200' },
  'pending_verification':  { label: 'Pending Review',     style: 'bg-amber-50 text-amber-800 border-amber-200' },
  'verified':              { label: 'Verified',           style: 'bg-emerald-50 text-[#1F9D55] border-emerald-200 font-bold' },
  'matched':               { label: 'AI Matched',         style: 'bg-[#FF6B4A]/10 text-[#FF6B4A] border-[#FF6B4A]/30 font-bold' },
  'in collaboration':      { label: 'In Collaboration',   style: 'bg-indigo-50 text-[#1E2A5E] border-indigo-200 font-semibold' },
  'in_collaboration':      { label: 'In Collaboration',   style: 'bg-indigo-50 text-[#1E2A5E] border-indigo-200 font-semibold' },
  'prototype ready':       { label: 'Prototype Ready',    style: 'bg-purple-50 text-purple-800 border-purple-200' },
  'deployed':              { label: 'Deployed & Live',    style: 'bg-[#1F9D55] text-white border-[#1F9D55] font-bold shadow-xs' },
  'live':                  { label: 'Live Telemetry',     style: 'bg-[#1F9D55] text-white border-[#1F9D55] font-bold' },
  'rejected':              { label: 'Rejected',           style: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const StatusBadge: React.FC<{ status: ProblemStatus | string }> = ({ status }) => {
  const normalized = status?.toLowerCase();
  const item = statusConfig[normalized] ?? { label: status, style: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${item.style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {item.label}
    </span>
  );
};

const urgencyColors: Record<UrgencyLevel, string> = {
  low:      'bg-slate-100 text-slate-700 border-slate-200',
  medium:   'bg-amber-50 text-amber-800 border-amber-200',
  high:     'bg-orange-50 text-orange-800 border-orange-200',
  critical: 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs',
};

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel }> = ({ urgency }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold border ${urgencyColors[urgency] || urgencyColors.medium}`}>
    {urgency} Priority
  </span>
);
