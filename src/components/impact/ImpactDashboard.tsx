import React, { useState, useEffect } from 'react';
import { impactService } from '../../services/impactService';
import type { ImpactStats } from '../../types';
import { StatCard } from '../common/StatCard';
import { BarChart } from '../charts/BarChart';
import { LineChart } from '../charts/LineChart';
import { DonutChart } from '../charts/DonutChart';
import { FunnelChart } from '../charts/FunnelChart';
import { AsyncBoundary } from '../ui/AsyncBoundary';
import { Button } from '../ui/Button';
import {
  FileText,
  CheckCircle2,
  Users,
  Cpu,
  Rocket,
  Heart,
  TrendingUp,
  Award,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const ImpactDashboard: React.FC = () => {
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  const fetchStats = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await impactService.getStats();
      setStats(res.data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stories = stats?.successStories || [];
  const currentStory = stories[storyIndex] || stories[0];

  const handleNextStory = () => {
    setStoryIndex((prev) => (prev + 1) % (stories.length || 1));
  };

  const handlePrevStory = () => {
    setStoryIndex((prev) => (prev - 1 + (stories.length || 1)) % (stories.length || 1));
  };

  return (
    <AsyncBoundary
      isLoading={isLoading}
      isError={isError}
      isEmpty={!stats}
      onRetry={fetchStats}
    >
      {stats && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header Action Banner */}
          <div className="civic-card p-6 sm:p-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F9D55]/10 text-[#1F9D55] text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>National Civic Innovation Impact Ledger</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
                  Public Impact & Telemetry Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Real-time transparent metrics tracking problem resolution rates, verified beneficiaries touched, and active research taskforces across India.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => alert('PDF report export generated: Includes full telemetry logs and SDG alignment ledger.')}
                  icon={<Download className="w-4 h-4" />}
                >
                  Export PDF Report
                </Button>
              </div>
            </div>
          </div>

          {/* ─── EXACT 7 METRICS STAT CARDS ───────────────────────────── */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Platform Headline Metrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Problems */}
              <StatCard
                title="1. Total Problems"
                value={stats.totalProblems}
                subtitle="Submitted nationwide"
                icon={<FileText className="w-5 h-5 text-[#1E2A5E]" />}
                trend="up"
                trendValue="+18% MoM"
              />

              {/* 2. Verified Problems */}
              <StatCard
                title="2. Verified Problems"
                value={stats.verifiedProblems}
                subtitle="Cleared ground scans"
                icon={<CheckCircle2 className="w-5 h-5 text-[#3E5C9A]" />}
                trend="up"
                trendValue="94.2% Authenticity"
              />

              {/* 3. Active Collaborations */}
              <StatCard
                title="3. Active Collaborations"
                value={stats.activeCollaborations}
                subtitle="Univ + Industry Taskforces"
                icon={<Users className="w-5 h-5 text-[#1E2A5E]" />}
                trend="up"
                trendValue="+12 new teams"
              />

              {/* 4. Solutions Developed */}
              <StatCard
                title="4. Solutions Developed"
                value={stats.solutionsDeveloped}
                subtitle="TRL 6–8 Working Prototypes"
                icon={<Cpu className="w-5 h-5 text-[#FF6B4A]" />}
                trend="up"
                trendValue="+9 this quarter"
                accent={true}
              />

              {/* 5. Solutions Deployed */}
              <StatCard
                title="5. Solutions Deployed"
                value={stats.solutionsDeployed}
                subtitle="Live Field Telemetry Units"
                icon={<Rocket className="w-5 h-5 text-[#1F9D55]" />}
                trend="up"
                trendValue="99.8% Uptime"
              />

              {/* 6. People Impacted */}
              <StatCard
                title="6. People Impacted"
                value={stats.peopleImpacted}
                subtitle="Verified Beneficiaries"
                icon={<Heart className="w-5 h-5 text-rose-600" />}
                trend="up"
                trendValue="+45,000 lives"
                accent={true}
              />

              {/* 7. Success Rate (%) */}
              <StatCard
                title="7. Success Rate (%)"
                value={`${stats.successRate}%`}
                subtitle="(Deployed ÷ Verified)"
                icon={<TrendingUp className="w-5 h-5 text-[#1E2A5E]" />}
                trend="up"
                trendValue="+2.4% vs target"
              />

              {/* Governance & Trust Card */}
              <StatCard
                title="Governance & Audit"
                value="100%"
                subtitle="Verifiable Public Ledger"
                icon={<ShieldCheck className="w-5 h-5 text-[#1F9D55]" />}
                trend="neutral"
                trendValue="Audited"
              />
            </div>
          </div>

          {/* ─── CHARTS SECTION (2x2 GRID) ────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Funnel Chart (Lifecycle Pipeline) */}
            <div className="civic-card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider">
                  Platform Lifecycle Pipeline Funnel
                </h3>
                <p className="text-xs text-slate-500">
                  Progression from Grassroots Submission → AI Match → Active Collaboration → Field Deployment.
                </p>
              </div>
              <FunnelChart data={stats.pipelineFunnel} />
            </div>

            {/* 2. Growth by Month Line Chart */}
            <div className="civic-card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider">
                  Platform Growth Over Time
                </h3>
                <p className="text-xs text-slate-500">
                  Monthly trajectory of incoming citizen problems versus deployed solutions.
                </p>
              </div>
              <LineChart
                data={stats.growthByMonth}
                xKey="month"
                lines={[
                  { key: 'problems', name: 'Problems Submitted', color: '#1E2A5E' },
                  { key: 'solutions', name: 'Solutions Deployed', color: '#FF6B4A' },
                ]}
                height={260}
              />
            </div>

            {/* 3. Category Breakdown Donut Chart */}
            <div className="civic-card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider">
                  Problems by Domain Sector
                </h3>
                <p className="text-xs text-slate-500">
                  Distribution across key civic sectors (Water, Waste, Energy, Health, Agriculture).
                </p>
              </div>
              <DonutChart data={stats.categoryBreakdown} height={260} />
            </div>

            {/* 4. Solutions by Region Bar Chart */}
            <div className="civic-card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider">
                  Solutions Deployed by Geographic Region
                </h3>
                <p className="text-xs text-slate-500">
                  Active field installations and taskforces across Indian administrative zones.
                </p>
              </div>
              <BarChart
                data={stats.solutionsByRegion}
                xKey="region"
                bars={[
                  { key: 'deployed', name: 'Live Deployed Units', color: '#1F9D55' },
                  { key: 'collaborations', name: 'Active R&D Taskforces', color: '#3E5C9A' },
                ]}
                height={260}
              />
            </div>

          </div>

          {/* ─── SUCCESS STORY CAROUSEL ───────────────────────────────── */}
          {currentStory && (
            <div className="civic-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FF6B4A]" />
                  <h3 className="text-base font-bold text-[#1E2A5E] font-heading">
                    Verified Deployment Impact Spotlight
                  </h3>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevStory}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    title="Previous Story"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400 font-mono-data">
                    {storyIndex + 1} / {stories.length}
                  </span>
                  <button
                    onClick={handleNextStory}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    title="Next Story"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1 rounded-2xl overflow-hidden h-52 bg-slate-100 shadow-sm">
                  <img
                    src={currentStory.image}
                    alt={currentStory.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-[#1E2A5E]">
                      {currentStory.category}
                    </span>
                    <span className="text-xs font-bold text-[#1F9D55]">
                      {currentStory.impact}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-[#1E2A5E] leading-snug">
                    {currentStory.title}
                  </h4>

                  <p className="text-xs text-slate-500 font-semibold">
                    Partners: {currentStory.partner}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-700 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                    "{currentStory.quote}"
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </AsyncBoundary>
  );
};
