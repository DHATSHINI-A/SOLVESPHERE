import React, { useState, useEffect } from 'react';
import { problemService } from '../../services/problemService';
import { impactService } from '../../services/impactService';
import { useAuth } from '../../context/AuthContext';
import type { ProblemItem, ImpactStats } from '../../types';
import { CategoryBadge, UrgencyBadge } from '../common/Badge';
import { Button } from '../ui/Button';
import { FunnelChart } from '../charts/FunnelChart';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Server,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { addNotification } = useAuth();
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [stats, setStats] = useState<ImpactStats | null>(null);

  // User management table state
  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Ravi Kumar', role: 'citizen', org: 'Gram Panchayat Forum', status: 'Active' },
    { id: 'u2', name: 'Dr. Anitha Rao', role: 'university', org: 'IIT Madras Lab', status: 'Active' },
    { id: 'u3', name: 'GreenTech Solutions Ltd.', role: 'industry', org: 'GreenTech CSR', status: 'Active' },
    { id: 'u4', name: 'CleanCity Urban Corp', role: 'industry', org: 'CleanCity Automation', status: 'Pending Approval' },
  ]);

  const fetchAdminData = async () => {
    const pRes = await problemService.getProblems();
    setProblems(pRes.data);
    const iRes = await impactService.getStats();
    setStats(iRes.data);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (id: string, approve: boolean) => {
    await problemService.updateProblemStatus(id, approve ? 'Verified' : 'Rejected');
    addNotification(
      approve ? 'Problem Statement Verified' : 'Problem Statement Flagged',
      `Problem #${id} has been ${approve ? 'approved and sent to the AI matchmaker pool' : 'rejected'}.`,
      approve ? 'success' : 'warning'
    );
    fetchAdminData();
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const next = u.status === 'Active' ? 'Suspended' : 'Active';
          addNotification('User Status Changed', `${u.name} is now ${next}.`, 'info');
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  const pendingProblems = problems.filter((p) => {
    const norm = p.status?.toLowerCase();
    return norm === 'new' || norm === 'draft' || norm === 'pending review' || norm === 'pending_verification';
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="civic-card p-6 sm:p-8 bg-gradient-to-r from-white via-slate-50 to-emerald-50/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F9D55]">
              <ShieldCheck className="w-4 h-4" />
              <span>National Innovation Ecosystem Governance & AI Moderation Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
              Admin Governance & Verification Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Moderate incoming grassroots statements, audit autonomous AI partner matches, and monitor platform health metrics.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 text-[#1F9D55] border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#1F9D55] animate-ping" />
            <span>Moderation Engine Active</span>
          </div>
        </div>
      </div>

      {/* Quick Governance Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending Review Queue</span>
          <p className="text-2xl font-extrabold text-[#E8A93B] font-mono-data">{pendingProblems.length} Items</p>
          <span className="text-[10px] text-slate-400">Avg turnaround &lt; 4 hrs</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Statements Verified</span>
          <p className="text-2xl font-extrabold text-[#1F9D55] font-mono-data">
            {problems.filter((p) => p.status?.toLowerCase() !== 'new' && p.status?.toLowerCase() !== 'draft').length}
          </p>
          <span className="text-[10px] text-slate-400">96.8% Authenticity rating</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">AI Match Precision</span>
          <p className="text-2xl font-extrabold text-[#3E5C9A] font-mono-data">98.4%</p>
          <span className="text-[10px] text-slate-400">0.2% Manual override rate</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">System API Status</span>
          <p className="text-2xl font-extrabold text-[#1E2A5E] font-mono-data">100% Online</p>
          <span className="text-[10px] text-slate-400">5G Telemetry cluster online</span>
        </div>
      </div>

      {/* Main Grid: Moderation Queue + Funnel Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Verification Queue & User Management */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Moderation Queue */}
          <div className="civic-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#E8A93B]" />
                  Awaiting Verification & Duplicate Moderation ({pendingProblems.length})
                </h3>
                <p className="text-xs text-slate-500">Inspect community statements before publishing to academic matchmaker.</p>
              </div>
            </div>

            {pendingProblems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#1F9D55] mx-auto" />
                <p className="text-xs font-bold text-slate-700">Verification queue is completely clear!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProblems.map((prob) => (
                  <div key={prob.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={prob.category} />
                          <UrgencyBadge urgency={prob.urgency} />
                          <span className="text-[10px] text-slate-400 font-mono-data">#{prob.id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#1E2A5E]">{prob.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{prob.description}</p>
                        <p className="text-[11px] text-slate-400">
                          Location: {prob.location} · Submitter: {prob.submitterName || prob.submittedBy}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleVerify(prob.id, true)}
                          icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#1F9D55]" />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerify(prob.id, false)}
                          className="text-rose-600 hover:bg-rose-50"
                          icon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Management Table */}
          <div className="civic-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#3E5C9A]" />
                User & Institution Directory Management
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-2">User / Org Name</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Affiliation</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-[#1E2A5E]">{u.name}</td>
                      <td className="py-3 capitalize text-slate-600">{u.role}</td>
                      <td className="py-3 text-slate-500">{u.org}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 text-[#1F9D55]'
                              : 'bg-amber-50 text-[#E8A93B]'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="text-[11px] text-[#3E5C9A] hover:underline font-bold cursor-pointer"
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Funnel Analytics & System Health */}
        <div className="space-y-6">
          
          {/* Pipeline Funnel */}
          {stats && (
            <div className="civic-card p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-wider">
                Ecosystem Lifecycle Pipeline Funnel
              </h3>
              <FunnelChart data={stats.pipelineFunnel} />
            </div>
          )}

          {/* System Health / API Status Widget */}
          <div className="civic-card p-5 space-y-4 bg-slate-900 text-white border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-200">
                <Server className="w-4 h-4 text-[#1F9D55]" />
                Infrastructure Health
              </h3>
              <span className="text-[10px] text-[#1F9D55] font-bold">ONLINE</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">NLP Vector Engine:</span>
                <span className="text-emerald-400 font-mono-data font-bold">14ms latency</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IoT Telemetry Cluster:</span>
                <span className="text-emerald-400 font-mono-data font-bold">99.98% uptime</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database Replica:</span>
                <span className="text-emerald-400 font-mono-data font-bold">Synced (AES-256)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
