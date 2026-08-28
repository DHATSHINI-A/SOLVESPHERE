import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { impactService } from '../../services/impactService';
import { collaborationService } from '../../services/collaborationService';
import type { DeploymentItem, CollaborationProject } from '../../types';
import { Button } from '../ui/Button';
import {
  Building2,
  Rocket,
  Sparkles,
  Edit,
  DollarSign,
  MapPin,
} from 'lucide-react';

export const IndustryDashboard: React.FC = () => {
  const { user, addNotification } = useAuth();
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [collabs, setCollabs] = useState<CollaborationProject[]>([]);

  // Corporate Profile Tags
  const [techOfferings, setTechOfferings] = useState([
    'CNC Pressure Vessel Fabrication',
    'Solar Inverter Integration',
    'Mass Scale Injection Molding',
    'IoT Fleet Gateway Telemetry',
  ]);
  const [newOffering, setNewOffering] = useState('');

  useEffect(() => {
    impactService.getDeployments().then((res) => setDeployments(res.data));
    collaborationService.getCollaborations().then((res) => setCollabs(res.data));
  }, []);

  const handleAddOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffering.trim()) return;
    setTechOfferings((prev) => [...prev, newOffering.trim()]);
    setNewOffering('');
    addNotification('Corporate Profile Updated', 'New manufacturing resource added to AI matchmaking engine.', 'success');
  };

  const totalBeneficiaries = deployments.reduce((acc, curr) => acc + (curr.peopleImpacted || curr.beneficiariesCount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="civic-card p-6 sm:p-8 bg-gradient-to-r from-white via-slate-50 to-indigo-50/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E2A5E]">
              <Building2 className="w-4 h-4" />
              <span>Corporate Innovation & Technology Transfer Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
              {user?.companyName || user?.organization || 'GreenTech Solutions Ltd.'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Co-fund university R&D prototypes, license patented tech, and track live CSR social returns on investment.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/problems">
              <Button variant="accent" size="md" icon={<Sparkles className="w-4 h-4" />}>
                Sponsor a Challenge
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Headline Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Problems Matched</span>
          <p className="text-2xl font-extrabold text-[#1E2A5E] font-mono-data">9 Proposals</p>
          <span className="text-[10px] text-slate-400">Seeking CSR co-funding</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Partnerships</span>
          <p className="text-2xl font-extrabold text-[#3E5C9A] font-mono-data">{collabs.length} Taskforces</p>
          <span className="text-[10px] text-slate-400">With top-tier universities</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Solutions Deployed</span>
          <p className="text-2xl font-extrabold text-[#1F9D55] font-mono-data">{deployments.length} Units</p>
          <span className="text-[10px] text-slate-400">Across 3 regional hubs</span>
        </div>

        <div className="civic-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">People Reached</span>
          <p className="text-2xl font-extrabold text-[#FF6B4A] font-mono-data">{totalBeneficiaries.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Verified CSR beneficiaries</span>
        </div>
      </div>

      {/* Main Grid: Deployment Pipeline + Corporate Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Deployment Pipeline & Matched Challenges */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Deployment Pipeline */}
          <div className="civic-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-[#1F9D55]" />
                  Active Commercial & CSR Deployment Pipeline
                </h3>
                <p className="text-xs text-slate-500">Live hardware units fabricated and installed in field locations.</p>
              </div>
              <Link to="/impact" className="text-xs font-bold text-[#3E5C9A] hover:underline">
                View Impact Telemetry →
              </Link>
            </div>

            <div className="space-y-3">
              {deployments.map((dep) => (
                <div key={dep.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1F9D55] text-white">
                          {dep.status}
                        </span>
                        <span className="text-xs font-bold text-[#1E2A5E]">{dep.title || dep.projectTitle}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {dep.location} · {dep.unitsDeployed || 1} Hardware Units Deployed
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#1F9D55] font-mono-data block">
                        {(dep.peopleImpacted || dep.beneficiariesCount || 0).toLocaleString()} Beneficiaries
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matched Problems Needing Funding */}
          <div className="civic-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
              Verified Problems Needing Industrial Scaling & CSR Funding
            </h3>

            <div className="space-y-3">
              {[
                { id: 'p1', title: 'Groundwater Contamination in Coastal Village', lab: 'IIT Madras Lab', grantReq: '₹45.0 L', match: 96 },
                { id: 'p4', title: 'Solar Cold Storage Micro-Hubs for Coastal Perishables', lab: 'Anna University Thermal Lab', grantReq: '₹60.0 L', match: 98 },
              ].map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#FF6B4A] bg-[#FF6B4A]/10 px-2 py-0.5 rounded-full">
                      {m.match}% Compatibility
                    </span>
                    <h4 className="text-xs font-bold text-[#1E2A5E] mt-1">{m.title}</h4>
                    <p className="text-[11px] text-slate-500">Academic Partner: {m.lab} · Required Capital: {m.grantReq}</p>
                  </div>
                  <Link to={`/problems/${m.id}`}>
                    <Button variant="primary" size="sm">
                      Inspect & Co-Fund
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: CSR ROI Summary & Technology Profile Editor */}
        <div className="space-y-6">
          
          {/* CSR / ROI Social Metrics Card */}
          <div className="civic-card p-5 space-y-4 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-200">
            <h3 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#1F9D55]" />
              CSR & ESG Impact Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">Total CSR Grants Deployed:</span>
                <strong className="font-mono-data text-[#1E2A5E]">₹1.85 Crore</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">Estimated SROI Multiplier:</span>
                <strong className="text-[#1F9D55]">3.4x Social Return</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">CO₂ Emissions Offset:</span>
                <strong className="text-[#1E2A5E]">495 Metric Tons</strong>
              </div>
            </div>
          </div>

          {/* Manufacturing Capability Editor */}
          <div className="civic-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-wider flex items-center gap-1.5">
              <Edit className="w-3.5 h-3.5 text-[#FF6B4A]" />
              Corporate Resource Profile
            </h3>
            <p className="text-[11px] text-slate-500">
              Capabilities your company can provide for problem-solving taskforces:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {techOfferings.map((offering) => (
                <span key={offering} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#1E2A5E] border border-indigo-200 text-[10px] font-bold">
                  {offering}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddOffering} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newOffering}
                onChange={(e) => setNewOffering(e.target.value)}
                placeholder="Add resource or tooling..."
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
              />
              <Button type="submit" variant="primary" size="sm">
                Add
              </Button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
