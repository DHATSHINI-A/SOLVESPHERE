import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { problemService } from '../../services/problemService';
import type { ProblemItem } from '../../types';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { Button } from '../ui/Button';
import { AsyncBoundary } from '../ui/AsyncBoundary';
import {
  Search,
  PlusCircle,
  ThumbsUp,
  MapPin,
  Calendar,
  LayoutGrid,
  List,
  ArrowRight,
} from 'lucide-react';

export const ProblemListing: React.FC = () => {
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'upvotes' | 'recent'>('upvotes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchProblems = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await problemService.getProblems({
        category: category !== 'all' ? category : undefined,
        status: status !== 'all' ? status : undefined,
        search: search || undefined,
      });
      setProblems(res.data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [category, status, search]);

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await problemService.upvoteProblem(id);
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const sortedProblems = [...problems].sort((a, b) => {
    if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const categories = [
    'all',
    'Water',
    'Agriculture',
    'Clean Energy',
    'Waste Management',
    'Health',
    'Smart Cities',
  ];

  const statuses = [
    'all',
    'New',
    'Verified',
    'Matched',
    'In Collaboration',
    'Deployed',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
            National Problem Statement Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, filter, and inspect verified grassroots challenges needing academic & industry solutions.
          </p>
        </div>

        <Link to="/problems/new" className="shrink-0">
          <Button variant="accent" size="md" icon={<PlusCircle className="w-4 h-4" />}>
            Submit New Problem
          </Button>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="civic-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keyword, location, or required skill..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Domains / Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort & Grid/List Toggle */}
          <div className="lg:col-span-2 flex items-center justify-end gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-[#1A1D29] focus:outline-none"
            >
              <option value="upvotes">Top Upvoted</option>
              <option value="recent">Most Recent</option>
            </select>

            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#1E2A5E] shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-[#1E2A5E] shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Listing View */}
      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={sortedProblems.length === 0}
        emptyTitle="No Problems Match Filters"
        emptyMessage="Try widening your search terms or selecting 'All Domains' to discover challenges across India."
        emptyAction={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch('');
              setCategory('all');
              setStatus('all');
            }}
          >
            Reset Filters
          </Button>
        }
        onRetry={fetchProblems}
      >
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProblems.map((prob) => (
              <div
                key={prob.id}
                className="civic-card civic-card-interactive p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <CategoryBadge category={prob.category} />
                    <StatusBadge status={prob.status} />
                  </div>

                  <Link to={`/problems/${prob.id}`}>
                    <h3 className="text-sm sm:text-base font-bold text-[#1E2A5E] group-hover:text-[#FF6B4A] transition-colors line-clamp-2 leading-snug">
                      {prob.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {prob.description}
                  </p>

                  {/* Expertise Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prob.requiredExpertise.slice(0, 3).map((exp) => (
                      <span
                        key={exp}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                      >
                        {exp}
                      </span>
                    ))}
                    {prob.requiredExpertise.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold">
                        +{prob.requiredExpertise.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[120px]">{prob.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleUpvote(prob.id, e)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#1F9D55]/10 hover:text-[#1F9D55] text-slate-600 font-bold text-xs transition cursor-pointer"
                      title="Upvote Community Priority"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{prob.upvotes}</span>
                    </button>

                    <Link to={`/problems/${prob.id}`}>
                      <Button variant="ghost" size="sm" className="p-1.5 text-[#3E5C9A] hover:bg-slate-100">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* Stacked Table / List View */
          <div className="civic-card overflow-hidden divide-y divide-slate-100">
            {sortedProblems.map((prob) => (
              <div
                key={prob.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={prob.category} />
                    <StatusBadge status={prob.status} />
                  </div>

                  <Link to={`/problems/${prob.id}`}>
                    <h3 className="text-sm font-bold text-[#1E2A5E] group-hover:text-[#FF6B4A] transition-colors">
                      {prob.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-1 max-w-3xl">
                    {prob.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {prob.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {prob.date}</span>
                    <span>Submitter: {prob.submitterName || prob.submittedBy}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => handleUpvote(prob.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1F9D55]/10 hover:text-[#1F9D55] text-slate-700 font-bold text-xs transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{prob.upvotes}</span>
                  </button>

                  <Link to={`/problems/${prob.id}`}>
                    <Button variant="primary" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </AsyncBoundary>

    </div>
  );
};
