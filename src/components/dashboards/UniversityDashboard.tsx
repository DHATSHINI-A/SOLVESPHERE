import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collaborationService } from '../../services/collaborationService';
import type { CollaborationProject } from '../../types';
import { Button } from '../ui/Button';
import {
  GraduationCap,
  Sparkles,
  Users,
  BookOpen,
  Kanban,
  Edit,
} from 'lucide-react';

export const UniversityDashboard: React.FC = () => {
  const { user, addNotification } = useAuth();
  const [collabs, setCollabs] = useState<CollaborationProject[]>([]);
  
  // Research Team state
  const [researchers] = useState([
    { name: 'Dr. Anitha Rao', role: 'Principal Investigator', focus: 'Membrane Filtration', activeProjects: 2 },
    { name: 'Kavitha M.', role: 'PhD Scholar', focus: 'IoT Sensor Calibration', activeProjects: 1 },
    { name: 'Siddharth V.', role: 'M.Tech Developer', focus: 'Embedded Telemetry', activeProjects: 1 },
  ]);

  // Publications / Output tracker
  const [outputs] = useState([
    { title: 'Low-Pressure Nanofiltration for High Salinity Aquifers', type: 'IEEE Journal Paper', date: '2026-05', status: 'Published' },
    { title: 'Anti-Fouling Composite Membrane Rig TRL-6', type: 'Working Hardware Prototype', date: '2026-07', status: 'Validated' },
  ]);

  // Expertise tags
  const [expertiseTags, setExpertiseTags] = useState([
    'Water Quality Engineering',
    'Membrane Separation',
    'IoT Micro-Sensors',
    'Hydro-Geochemistry',
    'Edge Telemetry',
  ]);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    collaborationService.getCollaborations().then((res) => setCollabs(res.data));
  }, []);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    setExpertiseTags((prev) => [...prev, newTagInput.trim()]);
    setNewTagInput('');
    addNotification('Lab Profile Updated', 'New expertise vector indexed by AI matching engine.', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="civic-card p-6 sm:p-8 bg-gradient-to-r from-white via-slate-50 to-blue-50/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3E5C9A]">
              <GraduationCap className="w-4 h-4" />
              <span>University Research & Student Innovation Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
              {user?.organization || 'IIT Madras - Env. Engineering Lab'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Lead Researcher: <strong>{user?.name || 'Dr. Anitha Rao'}</strong> · Department of Environmental Engineering
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/problems">
              <Button variant="accent" size="md" icon={<Sparkles className="w-4 h-4" />}>
                Explore Matched Problems
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Problems Matched</span>
          <p className="text-2xl font-extrabold text-[#1E2A5E] font-mono-data">14 Challenges</p>
          <span className="text-[10px] text-slate-400">92%+ AI compatibility</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Taskforces</span>
          <p className="text-2xl font-extrabold text-[#3E5C9A] font-mono-data">{collabs.length} Workspaces</p>
          <span className="text-[10px] text-slate-400">With Industry CSR co-funding</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Solutions Co-Developed</span>
          <p className="text-2xl font-extrabold text-[#1F9D55] font-mono-data">4 TRL-7 Prototypes</p>
          <span className="text-[10px] text-slate-400">Ready for factory scaling</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Student Lab Members</span>
          <p className="text-2xl font-extrabold text-[#FF6B4A] font-mono-data">{researchers.length} Active</p>
          <span className="text-[10px] text-slate-400">Scholars & M.Tech interns</span>
        </div>
      </div>

      {/* Main Grid: Matched Problems + Active Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Matched Problems & Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Matched Problems */}
          <div className="civic-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
                  AI Suggested Problem Statements For Your Lab
                </h3>
                <p className="text-xs text-slate-500">Ranked by algorithmic patent & equipment match.</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'p1', title: 'Groundwater Contamination in Coastal Village', score: 96, budget: '₹45.0 L', sponsor: 'GreenTech Solutions Ltd.' },
                { id: 'p2', title: 'Municipal Waste Segregation Failure', score: 92, budget: '₹38.0 L', sponsor: 'CleanCity Urban Corp' },
                { id: 'p3', title: 'Hyper-Local Crop Pest Early Warning System', score: 89, budget: '₹32.0 L', sponsor: 'KisanVikas Innovations' },
              ].map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#1E2A5E] transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B4A]/10 text-[#FF6B4A]">
                        {p.score}% Compatibility
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono-data font-bold">Grant: {p.budget}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1E2A5E]">{p.title}</h4>
                    <p className="text-[11px] text-slate-500">Industry Sponsor: {p.sponsor}</p>
                  </div>

                  <Link to={`/problems/${p.id}/matches`} className="shrink-0">
                    <Button variant="primary" size="sm">
                      Accept & Open Workspace
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Active Collaborations */}
          <div className="civic-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-2">
              <Kanban className="w-4 h-4 text-[#3E5C9A]" />
              Active Workspace Collaborations
            </h3>

            <div className="space-y-3">
              {collabs.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1E2A5E]">{c.title}</h4>
                      <p className="text-xs text-slate-500">Progress: {c.progress}% · Milestone: TRL-{c.trlLevel}</p>
                    </div>
                    <Link to={`/collaboration/${c.id}`}>
                      <Button variant="secondary" size="sm">
                        Enter Workspace →
                      </Button>
                    </Link>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#1E2A5E] h-full rounded-full" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publications & Output Tracker */}
          <div className="civic-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1F9D55]" />
                Research Output & Prototype Tracker
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {outputs.map((out) => (
                <div key={out.title} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-[#1E2A5E]">{out.title}</h5>
                    <span className="text-[10px] text-slate-400">{out.type} · {out.date}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#1F9D55] border border-emerald-200">
                    {out.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Team Management & AI Profile Editor */}
        <div className="space-y-6">
          
          {/* Research Team Management */}
          <div className="civic-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#3E5C9A]" />
                Lab Research Team
              </h3>
              <span className="text-[10px] text-slate-400">{researchers.length} Solvers</span>
            </div>

            <div className="space-y-3">
              {researchers.map((r) => (
                <div key={r.name} className="p-3 bg-slate-50 rounded-xl space-y-0.5 text-xs">
                  <h4 className="font-bold text-[#1E2A5E]">{r.name}</h4>
                  <p className="text-[10px] text-[#3E5C9A] font-semibold">{r.role}</p>
                  <p className="text-[10px] text-slate-500">Domain: {r.focus}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Matching Profile Editor */}
          <div className="civic-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-1.5">
                <Edit className="w-3.5 h-3.5 text-[#FF6B4A]" />
                AI Lab Capability Profile
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Tags used by the AI engine to route national problem statements directly to your lab.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {expertiseTags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#1E2A5E] border border-indigo-200 text-[10px] font-bold">
                  {tag}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddTag} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Add research skill..."
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
              />
              <Button type="submit" variant="primary" size="sm">
                Add Tag
              </Button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
