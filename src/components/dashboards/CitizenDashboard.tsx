import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { problemService } from '../../services/problemService';
import type { ProblemItem } from '../../types';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { Button } from '../ui/Button';
import { StepperPipeline } from '../ui/StepperPipeline';
import {
  FilePlus,
  ThumbsUp,
  MapPin,
  Sparkles,
  TrendingUp,
  Bell,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [trendingProblems, setTrendingProblems] = useState<ProblemItem[]>([]);

  useEffect(() => {
    problemService.getProblems().then((res) => {
      setProblems(res.data);
      setTrendingProblems(res.data.slice(0, 3));
    });
  }, []);

  const mySubmissions = problems.filter(
    (p) => p.submittedBy === user?.id || p.submittedBy === 'u1' || p.submitterName === user?.name
  );

  const verifiedCount = mySubmissions.filter((p) => p.status === 'Verified' || p.status === 'Matched' || p.status === 'In Collaboration' || p.status === 'Deployed').length;
  const inCollabCount = mySubmissions.filter((p) => p.status === 'In Collaboration' || p.status === 'Matched').length;
  const deployedCount = mySubmissions.filter((p) => p.status === 'Deployed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="civic-card p-6 sm:p-8 bg-gradient-to-r from-white via-slate-50 to-indigo-50/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B4A]">
              <Sparkles className="w-4 h-4" />
              <span>Citizen & Community Action Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
              Welcome back, {user?.name || 'Citizen Submitter'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Track your submitted problem statements through verification, AI partner matching, and field solution deployment.
            </p>
          </div>

          <Link to="/problems/new" className="shrink-0">
            <Button variant="accent" size="lg" icon={<FilePlus className="w-4 h-4" />}>
              Submit New Problem
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">My Submissions</span>
          <p className="text-2xl font-extrabold text-[#1E2A5E] font-mono-data">{mySubmissions.length}</p>
          <span className="text-[10px] text-slate-400">Total challenges lodged</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Verified by Admin</span>
          <p className="text-2xl font-extrabold text-[#1F9D55] font-mono-data">{verifiedCount}</p>
          <span className="text-[10px] text-slate-400">Passed ground checks</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">In Active R&D</span>
          <p className="text-2xl font-extrabold text-[#3E5C9A] font-mono-data">{inCollabCount}</p>
          <span className="text-[10px] text-slate-400">Matched with laboratories</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Solutions Deployed</span>
          <p className="text-2xl font-extrabold text-[#FF6B4A] font-mono-data">{deployedCount}</p>
          <span className="text-[10px] text-slate-400">Active in field operations</span>
        </div>
      </div>

      {/* Main Content Layout: Submissions with Stepper + Community Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: My Submitted Problems with Live Steppers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider">
              My Submitted Problems & Pipeline Status
            </h2>
            <span className="text-xs text-slate-400">{mySubmissions.length} Statements</span>
          </div>

          <div className="space-y-4">
            {mySubmissions.map((prob) => (
              <div key={prob.id} className="civic-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={prob.category} />
                      <StatusBadge status={prob.status} />
                      <span className="text-[10px] text-slate-400 font-mono-data">#{prob.id}</span>
                    </div>
                    <Link to={`/problems/${prob.id}`}>
                      <h3 className="text-base font-bold text-[#1E2A5E] hover:text-[#FF6B4A] transition-colors leading-snug">
                        {prob.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2">{prob.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/problems/${prob.id}`}>
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {prob.status === 'Matched' && (
                      <Link to={`/problems/${prob.id}/matches`}>
                        <Button variant="accent" size="sm">
                          Inspect Matches
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stepper Pipeline for this problem */}
                <div className="pt-3 border-t border-slate-100">
                  <StepperPipeline currentStage={prob.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Notifications & Community Feed */}
        <div className="space-y-6">
          
          {/* Notification Alert Box */}
          <div className="civic-card p-5 space-y-3 bg-indigo-50/50 border-indigo-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E2A5E]">
              <Bell className="w-4 h-4 text-[#FF6B4A]" />
              <span>Matching Alert</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Your groundwater contamination problem was matched with <strong className="text-[#1E2A5E]">IIT Madras</strong> and <strong className="text-[#1E2A5E]">GreenTech Solutions</strong>.
            </p>
            <Link to="/problems/p1/matches" className="block pt-1">
              <Button variant="accent" size="sm" className="w-full justify-center">
                Review Match Proposal
              </Button>
            </Link>
          </div>

          {/* Community Trending Feed */}
          <div className="civic-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#FF6B4A]" />
                Trending Community Issues
              </h3>
            </div>

            <div className="space-y-3">
              {trendingProblems.map((tp) => (
                <div key={tp.id} className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <CategoryBadge category={tp.category} />
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#1F9D55]">
                      <ThumbsUp className="w-3 h-3" /> {tp.upvotes}
                    </span>
                  </div>
                  <Link to={`/problems/${tp.id}`}>
                    <h4 className="font-bold text-[#1E2A5E] hover:underline line-clamp-1 mt-1">
                      {tp.title}
                    </h4>
                  </Link>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {tp.location}
                  </p>
                </div>
              ))}
            </div>

            <Link to="/problems" className="block pt-2">
              <Button variant="ghost" size="sm" className="w-full text-[#3E5C9A] justify-center">
                Browse Full Directory →
              </Button>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
