import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { problemService } from '../../services/problemService';
import type { ProblemItem } from '../../types';
import { Button } from '../ui/Button';
import { ConnectionThread } from '../ui/ConnectionThread';
import { AsyncBoundary } from '../ui/AsyncBoundary';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Brain,
  Lightbulb,
} from 'lucide-react';

export const AIAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<ProblemItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    problemService
      .getProblemById(id)
      .then((res) => {
        if (res.data) setProblem(res.data);
        else setIsError(true);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const defaultTags = [
    { name: 'Environmental Engineering', confidence: 96 },
    { name: 'Water Quality Sensors', confidence: 93 },
    { name: 'IoT Telemetry Mesh', confidence: 89 },
    { name: 'Membrane Separation Tech', confidence: 86 },
    { name: 'LoRaWAN Edge Nodes', confidence: 81 },
  ];

  const tags = problem?.aiAnalysis?.expertiseTags || defaultTags;

  return (
    <AsyncBoundary
      isLoading={isLoading}
      isError={isError}
      isEmpty={!problem}
      emptyTitle="Problem Statement Not Found"
      emptyMessage="Cannot generate AI analysis for a non-existent problem ID."
      emptyAction={
        <Link to="/problems">
          <Button variant="primary" size="sm">
            Back to Directory
          </Button>
        </Link>
      }
    >
      {problem && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header Banner */}
          <div className="civic-card p-6 sm:p-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-bold">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-wider">
                    AI Capability Vector Breakdown
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
                  AI Neural Analysis Report
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Automated natural language processing extraction of required engineering competencies for: <strong className="text-[#1E2A5E]">"{problem.title}"</strong>
                </p>
              </div>

              <Link to={`/problems/${problem.id}/matches`} className="shrink-0">
                <Button variant="accent" size="lg" icon={<Sparkles className="w-4 h-4" />}>
                  Find Matching Partners
                </Button>
              </Link>
            </div>
          </div>

          {/* Signature Connection Thread Visual */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Active Capability Bridge
            </h3>
            <ConnectionThread
              problemTitle={problem.title}
              universityName="IIT Madras - Env. Engg Lab"
              industryName="GreenTech Solutions Ltd."
              matchScore={problem.aiAnalysis?.feasibilityScore || 94}
            />
          </div>

          {/* AI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="civic-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Feasibility Rating</span>
                <Sparkles className="w-4 h-4 text-[#1F9D55]" />
              </div>
              <p className="text-3xl font-extrabold text-[#1F9D55] font-mono-data">
                {problem.aiAnalysis?.feasibilityScore || 92}%
              </p>
              <p className="text-xs text-slate-500">
                High commercialization probability with standard TRL-4 prototyping assets.
              </p>
            </div>

            <div className="civic-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Duplicate Probability</span>
                <ShieldCheck className="w-4 h-4 text-[#3E5C9A]" />
              </div>
              <p className="text-3xl font-extrabold text-[#3E5C9A] font-mono-data">
                {problem.aiAnalysis?.duplicateScore || 5}%
              </p>
              <p className="text-xs text-slate-500">
                Unique challenge with distinct geographic & chemical parameters.
              </p>
            </div>

            <div className="civic-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Target Readiness Level</span>
                <TrendingUp className="w-4 h-4 text-[#1E2A5E]" />
              </div>
              <p className="text-3xl font-extrabold text-[#1E2A5E] font-mono-data">
                TRL 3 → 7
              </p>
              <p className="text-xs text-slate-500">
                Ideal for university lab bench-scale testing progressing to industrial pilot.
              </p>
            </div>
          </div>

          {/* Extracted Expertise Chips with Confidence */}
          <div className="civic-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1E2A5E] font-heading">
                  Extracted Expertise & Relevance Scores
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The AI matching engine queries university faculty patents and industry manufacturing profiles using these exact tags:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.name}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2 hover:border-[#1E2A5E] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E2A5E]">{tag.name}</span>
                    <span className="text-xs font-bold text-[#FF6B4A] font-mono-data bg-[#FF6B4A]/10 px-2 py-0.5 rounded-full">
                      {tag.confidence}% match
                    </span>
                  </div>
                  
                  {/* Progress Meter */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1E2A5E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${tag.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Generated Summary Box */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E2A5E]">
                <Lightbulb className="w-4 h-4 text-[#FF6B4A]" />
                <span>Generated Technical Solution Pathway:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                "{problem.aiAnalysis?.summary || `This problem requires Environmental Engineering and IoT sensor expertise due to severe contamination gradients. Recommended solution pathway involves localized solar-powered nanofiltration with LoRaWAN telemetry monitoring.`}"
              </p>
            </div>

            {/* Bottom CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link to={`/problems/${problem.id}`}>
                <Button variant="ghost" size="md">
                  ← Back to Problem Overview
                </Button>
              </Link>

              <Link to={`/problems/${problem.id}/matches`}>
                <Button variant="accent" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Find Matching University & Industry Partners
                </Button>
              </Link>
            </div>

          </div>

        </div>
      )}
    </AsyncBoundary>
  );
};
