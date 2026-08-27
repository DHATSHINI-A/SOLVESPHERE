import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchService } from '../../services/matchService';
import { problemService } from '../../services/problemService';
import { collaborationService } from '../../services/collaborationService';
import { useAuth } from '../../context/AuthContext';
import type { MatchResult, MatchedPartner, ProblemItem } from '../../types';
import { Button } from '../ui/Button';
import { AsyncBoundary } from '../ui/AsyncBoundary';
import {
  Sparkles,
  GraduationCap,
  Building2,
  MapPin,
  Award,
  Check,
  Send,
  Scale,
  X,
} from 'lucide-react';

export const PartnerMatchingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useAuth();

  const [problem, setProblem] = useState<ProblemItem | null>(null);
  const [matchData, setMatchData] = useState<MatchResult | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'university' | 'industry'>('all');
  
  const [comparedPartners, setComparedPartners] = useState<MatchedPartner[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    Promise.all([
      problemService.getProblemById(id),
      matchService.getMatchesByProblemId(id),
    ])
      .then(([probRes, matchRes]) => {
        if (probRes.data) setProblem(probRes.data);
        if (matchRes.data) setMatchData(matchRes.data);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleInvite = async (partner: MatchedPartner) => {
    if (!id) return;
    await matchService.invitePartner(id, partner.id);
    setInvitedIds((prev) => [...prev, partner.id]);

    addNotification(
      'Invitation Sent',
      `Collaboration invite sent to ${partner.name}. They have been invited to form an R&D Taskforce.`,
      'success'
    );
  };

  const handleStartWorkspace = async (partner: MatchedPartner) => {
    if (!problem) return;
    const res = await collaborationService.createCollaboration(problem.id, problem.title);
    addNotification(
      'R&D Workspace Initialized',
      `Workspace activated between you and ${partner.name}.`,
      'success'
    );
    navigate(`/collaboration/${res.data.id}`);
  };

  const toggleCompare = (partner: MatchedPartner) => {
    if (comparedPartners.some((p) => p.id === partner.id)) {
      setComparedPartners((prev) => prev.filter((p) => p.id !== partner.id));
    } else {
      if (comparedPartners.length >= 3) {
        alert('You can compare a maximum of 3 partners side-by-side.');
        return;
      }
      setComparedPartners((prev) => [...prev, partner]);
    }
  };

  const filteredPartners = (matchData?.partners || []).filter((p) => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  return (
    <AsyncBoundary
      isLoading={isLoading}
      isError={isError}
      isEmpty={!matchData || filteredPartners.length === 0}
      emptyTitle="No Partner Matches Found"
      emptyMessage="The matching engine is currently indexing more academic labs and industry sponsors."
    >
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Page Header */}
        <div className="civic-card p-6 sm:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Vector AI Match Results</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
                Ranked Solution Partners
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Top universities and CSR industry sponsors matching problem #{id}: <strong className="text-[#1E2A5E]">"{problem?.title}"</strong>
              </p>
            </div>

            {comparedPartners.length > 0 && (
              <Button
                variant="accent"
                size="md"
                onClick={() => setIsComparing(true)}
                icon={<Scale className="w-4 h-4" />}
              >
                Compare {comparedPartners.length} Partners Side-by-Side
              </Button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Partners' },
              { id: 'university', label: 'Universities / Labs' },
              { id: 'industry', label: 'Industry Sponsors' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-[#1E2A5E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredPartners.length} verified matches (Scored 85%+ compatibility)
          </span>
        </div>

        {/* Partner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => {
            const isInvited = invitedIds.includes(partner.id);
            const isSelectedForCompare = comparedPartners.some((p) => p.id === partner.id);
            const isUniv = partner.type === 'university';

            return (
              <div
                key={partner.id}
                className={`civic-card p-6 flex flex-col justify-between space-y-5 relative transition-all duration-200 ${
                  isSelectedForCompare ? 'ring-2 ring-[#FF6B4A]' : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          isUniv ? 'bg-blue-50 text-[#3E5C9A]' : 'bg-emerald-50 text-[#1F9D55]'
                        }`}
                      >
                        {isUniv ? <GraduationCap className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          {isUniv ? 'Academic R&D' : 'Industry Sponsor'}
                        </span>
                        <h3 className="text-sm font-bold text-[#1E2A5E] leading-snug">
                          {partner.name}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold text-[#FF6B4A] font-mono-data block">
                        {partner.matchScore}%
                      </span>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Match Fit</span>
                    </div>
                  </div>

                  {/* Matched Expertise */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Matched Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {partner.matchedExpertise.map((exp) => (
                        <span
                          key={exp}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location:
                      </span>
                      <strong className="text-[#1E2A5E]">{partner.location}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Award className="w-3.5 h-3.5 text-slate-400" /> Past Projects:
                      </span>
                      <strong className="text-[#1E2A5E]">{partner.pastProjectCount} Deployed</strong>
                    </div>

                    {isUniv && partner.trlLevel && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Lab Readiness:</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-[#1E2A5E] text-[10px] font-bold">
                          TRL-{partner.trlLevel} Prototypes
                        </span>
                      </div>
                    )}

                    {!isUniv && partner.csrBudget && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">CSR Grant Pool:</span>
                        <strong className="text-[#1F9D55] font-mono-data">
                          ₹{(partner.csrBudget / 100000).toFixed(1)} Lakhs
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleCompare(partner)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        isSelectedForCompare
                          ? 'bg-[#FF6B4A] text-white border-[#FF6B4A]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isSelectedForCompare ? 'Selected' : '+ Compare'}
                    </button>

                    <Button
                      variant={isInvited ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleInvite(partner)}
                      disabled={isInvited}
                      icon={isInvited ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    >
                      {isInvited ? 'Invited' : 'Invite'}
                    </Button>
                  </div>

                  <Button
                    variant="accent"
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={() => handleStartWorkspace(partner)}
                  >
                    Open Collaboration Workspace →
                  </Button>
                </div>

              </div>
            );
          })}
        </div>

        {/* ─── Comparison Modal ────────────────────────────────────────── */}
        {isComparing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#FF6B4A]" />
                  <h3 className="text-lg font-bold text-[#1E2A5E] font-heading">
                    Partner Capability Comparison ({comparedPartners.length} Selected)
                  </h3>
                </div>
                <button onClick={() => setIsComparing(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {comparedPartners.map((p) => (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-[#1E2A5E]">{p.name}</h4>
                      <span className="text-sm font-bold text-[#FF6B4A] font-mono-data">{p.matchScore}%</span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Type:</span>
                        <span className="capitalize font-semibold">{p.type}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Location:</span>
                        <span>{p.location}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Expertise Match:</span>
                        <p className="text-[11px] text-slate-700">{p.matchedExpertise.join(', ')}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed Projects:</span>
                        <span className="font-bold">{p.pastProjectCount} Units</span>
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button variant="accent" size="sm" className="w-full justify-center text-xs" onClick={() => handleStartWorkspace(p)}>
                        Select & Initialize
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </AsyncBoundary>
  );
};
