import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { impactService } from '../../services/impactService';
import { collaborationService } from '../../services/collaborationService';
import { useAuth } from '../../context/AuthContext';
import type { DeploymentItem, CollaborationProject } from '../../types';
import { Button } from '../ui/Button';
import { StepperPipeline } from '../ui/StepperPipeline';
import {
  Rocket,
  MapPin,
  Calendar,
  ArrowRight,
  Radio,
} from 'lucide-react';

export const DeploymentPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { addNotification } = useAuth();

  const [collab, setCollab] = useState<CollaborationProject | null>(null);
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [isDeployingNew, setIsDeployingNew] = useState(false);

  // New deployment form state
  const [locationName, setLocationName] = useState('Coastal Villages, Tiruvottiyur, TN');
  const [unitsDeployed, setUnitsDeployed] = useState(12);
  const [beneficiaries, setBeneficiaries] = useState(18500);

  useEffect(() => {
    collaborationService.getCollaborationById(projectId || 'c1').then((res) => {
      if (res.data) setCollab(res.data);
    });
    impactService.getDeployments().then((res) => setDeployments(res.data));
  }, [projectId]);

  const handleCreateDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    await impactService.createDeployment({
      problemId: collab?.problemId || 'p1',
      title: collab?.title || 'Solar Water Nanofiltration Hub',
      status: 'Live',
      deployedBy: 'IIT Madras & GreenTech Solutions',
      partnerOrg: 'GreenTech Solutions Ltd.',
      location: locationName,
      region: 'South India',
      unitsDeployed: Number(unitsDeployed),
      peopleImpacted: Number(beneficiaries),
      metrics: {
        dailyOutput: '35,000 Liters',
        salinityReduction: '99.4%',
        co2Offset: '185 Tons',
        systemUptime: '99.9%',
      },
    });

    addNotification(
      'Solution Live in Field',
      `Field deployment logged in ${locationName}. Impact telemetry updated!`,
      'success'
    );

    setIsDeployingNew(false);
    impactService.getDeployments().then((res) => setDeployments(res.data));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="civic-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1F9D55]/10 text-[#1F9D55] border border-[#1F9D55]/20 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Live Field Operations & Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
              Solution Deployment Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Tracking real-world field rollouts, hardware installation units, and beneficiary reach across India.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="accent"
              size="md"
              onClick={() => setIsDeployingNew(true)}
              icon={<Rocket className="w-4 h-4" />}
            >
              Log New Field Unit Rollout
            </Button>
          </div>
        </div>

        {/* Stepper position */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
            Pipeline Stage: Field Deployment
          </span>
          <StepperPipeline currentStage="deployment" />
        </div>
      </div>

      {/* Deployment Form Modal */}
      {isDeployingNew && (
        <div className="civic-card p-6 sm:p-8 border-2 border-[#1F9D55]/40 space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#1E2A5E] font-heading flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#1F9D55]" />
              Log Field Solution Rollout
            </h3>
            <button onClick={() => setIsDeployingNew(false)} className="text-xs text-slate-400 hover:text-slate-700">
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateDeployment} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Deployment Location *</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hardware Units Installed *</label>
              <input
                type="number"
                required
                value={unitsDeployed}
                onChange={(e) => setUnitsDeployed(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Estimated Beneficiaries *</label>
              <input
                type="number"
                required
                value={beneficiaries}
                onChange={(e) => setBeneficiaries(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsDeployingNew(false)}>
                Close
              </Button>
              <Button type="submit" variant="primary" size="md">
                Publish Deployment
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Active Deployments Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider">
            Active Field Deployments ({deployments.length})
          </h3>
          <Link to="/impact" className="text-xs font-bold text-[#3E5C9A] hover:underline flex items-center gap-1">
            View Aggregate Impact Analytics <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deployments.map((dep) => (
            <div key={dep.id} className="civic-card p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1F9D55] text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {dep.status}
                  </span>
                  <span className="text-xs font-mono-data text-slate-400 font-bold">
                    ID #{dep.id}
                  </span>
                </div>

                <h4 className="text-base font-bold text-[#1E2A5E]">{dep.title}</h4>
                <p className="text-xs text-slate-500 font-medium">Partner: {dep.deployedBy}</p>

                <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {dep.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {dep.dateDeployed}</span>
                </div>
              </div>

              {/* Metrics Box */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Units Installed</span>
                  <span className="text-xl font-extrabold text-[#1E2A5E] font-mono-data">{dep.unitsDeployed}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">People Impacted</span>
                  <span className="text-xl font-extrabold text-[#1F9D55] font-mono-data">{dep.peopleImpacted ? dep.peopleImpacted.toLocaleString() : '15,000'}</span>
                </div>
              </div>

              <Link to="/impact" className="pt-2 block">
                <Button variant="secondary" size="sm" className="w-full justify-center">
                  Inspect in National Impact Dashboard →
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
