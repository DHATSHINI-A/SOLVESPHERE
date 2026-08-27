import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { problemService } from '../../services/problemService';
import type { ProblemItem } from '../../types';
import { CategoryBadge, StatusBadge, UrgencyBadge } from '../common/Badge';
import { Button } from '../ui/Button';
import { StepperPipeline } from '../ui/StepperPipeline';
import { AsyncBoundary } from '../ui/AsyncBoundary';
import {
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  Sparkles,
  Cpu,
  MessageSquare,
  Send,
  Target,
  IndianRupee,
} from 'lucide-react';

export const ProblemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [problem, setProblem] = useState<ProblemItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [comments, setComments] = useState<Array<{ name: string; text: string; time: string }>>([
    { name: 'Kisan Samiti Representative', text: 'This groundwater issue has forced villagers to buy water cans daily. High urgency needed.', time: '2 days ago' },
    { name: 'Dr. Anitha Rao (IIT Madras)', text: 'Our lab has bench-tested low pressure composite membranes that can achieve 99% desalination here.', time: '1 day ago' },
  ]);
  const [newComment, setNewComment] = useState('');

  const fetchProblem = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await problemService.getProblemById(id);
      if (res.data) {
        setProblem(res.data);
      } else {
        setIsError(true);
      }
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const handleUpvote = async () => {
    if (!problem) return;
    await problemService.upvoteProblem(problem.id);
    setProblem((prev) => (prev ? { ...prev, upvotes: prev.upvotes + 1 } : null));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      { name: 'Community Member', text: newComment.trim(), time: 'Just now' },
    ]);
    setNewComment('');
  };

  return (
    <AsyncBoundary
      isLoading={isLoading}
      isError={isError}
      isEmpty={!problem}
      emptyTitle="Problem Statement Not Found"
      emptyMessage="The requested problem statement does not exist or may have been removed."
      emptyAction={
        <Link to="/problems">
          <Button variant="primary" size="sm">
            Back to Directory
          </Button>
        </Link>
      }
      onRetry={fetchProblem}
    >
      {problem && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header Action Bar */}
          <div className="civic-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={problem.category} />
                  <StatusBadge status={problem.status} />
                  <UrgencyBadge urgency={problem.urgency} />
                  <span className="text-xs font-mono-data text-slate-400 font-bold">
                    Statement #{problem.id}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
                  {problem.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <strong>{problem.location}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    Submitted by: <strong>{problem.submitterName || problem.submittedBy}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Date: <strong>{problem.date}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleUpvote}
                  icon={<ThumbsUp className="w-4 h-4 text-[#1F9D55]" />}
                >
                  <span>{problem.upvotes} Upvotes</span>
                </Button>

                <Link to={`/problems/${problem.id}/analysis`}>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Cpu className="w-4 h-4 text-[#FF6B4A]" />}
                  >
                    View AI Analysis
                  </Button>
                </Link>

                <Link to={`/problems/${problem.id}/matches`}>
                  <Button
                    variant="accent"
                    size="md"
                    icon={<Sparkles className="w-4 h-4" />}
                  >
                    Partner Matches
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pipeline Stage Stepper */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                Lifecycle Pipeline Position
              </span>
              <StepperPipeline currentStage={problem.status} />
            </div>
          </div>

          {/* Detailed Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Description, Expertise, Comments */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Problem Description */}
              <div className="civic-card p-6 space-y-3">
                <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider">
                  Detailed Challenge Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {problem.description}
                </p>
              </div>

              {/* Required Expertise Chips */}
              <div className="civic-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider">
                    Required Engineering & Scientific Competencies
                  </h3>
                  <span className="text-xs text-[#3E5C9A] font-bold">AI Extracted</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {problem.requiredExpertise.map((exp) => (
                    <span
                      key={exp}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-[#1E2A5E] text-xs font-semibold"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Discussion & Community Comments */}
              <div className="civic-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#3E5C9A]" />
                    Community Comments ({comments.length})
                  </h3>
                  <span className="text-xs text-slate-400">Public Forum</span>
                </div>

                <div className="space-y-3">
                  {comments.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1E2A5E]">{c.name}</span>
                        <span className="text-slate-400 text-[11px]">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>

                {/* Post Comment Input */}
                <form onSubmit={handleAddComment} className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Contribute domain insight, field test data, or local feedback..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                  />
                  <Button type="submit" variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                    Post
                  </Button>
                </form>
              </div>

            </div>

            {/* Right 1 Col: Metadata, Impact Scope, Next Step CTA */}
            <div className="space-y-6">
              
              {/* Quick Metadata Box */}
              <div className="civic-card p-6 space-y-4">
                <h4 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-widest border-b border-slate-100 pb-2">
                  Key Parameters
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#3E5C9A]" />
                      Beneficiaries Target:
                    </span>
                    <strong className="text-right text-[#1E2A5E]">
                      {problem.targetBeneficiaries || '25,000 community members'}
                    </strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-[#1F9D55]" />
                      Estimated R&D Budget:
                    </span>
                    <strong className="text-right font-mono-data text-[#1E2A5E]">
                      ₹{((problem.estimatedBudgetReq || 3500000) / 100000).toFixed(1)} Lakhs
                    </strong>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      UN SDG Goal:
                    </span>
                    <strong className="text-right text-[#1E2A5E]">
                      Goal #{problem.sdgGoal || 6}
                    </strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link to={`/problems/${problem.id}/matches`} className="block">
                    <Button variant="accent" size="md" className="w-full justify-center">
                      Find Matching Partners
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}
    </AsyncBoundary>
  );
};
