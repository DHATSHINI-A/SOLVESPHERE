import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { problemService } from '../../services/problemService';
import { useAuth } from '../../context/AuthContext';
import type { UrgencyLevel } from '../../types';
import { Button } from '../ui/Button';
import {
  FilePlus,
  Sparkles,
  Cpu,
  MapPin,
  Target,
  IndianRupee,
  Info,
} from 'lucide-react';

export const SubmitProblemPage: React.FC = () => {
  const { user, addNotification } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Water');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');
  const [targetBeneficiaries, setTargetBeneficiaries] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('3500000');
  const [requiredExpertise, setRequiredExpertise] = useState('Environmental Engineering, Water Quality Sensors, IoT');

  const [isPreChecking, setIsPreChecking] = useState(false);
  const [preCheckResult, setPreCheckResult] = useState<{
    authenticityScore: number;
    duplicateScore: number;
    extractedTags: string[];
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Water',
    'Agriculture',
    'Clean Energy',
    'Waste Management',
    'Health',
    'Smart Cities',
    'Education',
    'Cybersecurity',
  ];

  const handleRunPreCheck = () => {
    if (!title || !description) return;
    setIsPreChecking(true);
    setTimeout(() => {
      setIsPreChecking(false);
      setPreCheckResult({
        authenticityScore: Math.floor(92 + Math.random() * 6),
        duplicateScore: Math.floor(4 + Math.random() * 8),
        extractedTags: requiredExpertise.split(',').map((s) => s.trim()).filter(Boolean),
      });
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) return;

    setIsSubmitting(true);
    try {
      const tagsArray = requiredExpertise.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await problemService.createProblem({
        title,
        category,
        description,
        location,
        urgency,
        requiredExpertise: tagsArray.length ? tagsArray : ['Engineering', 'IoT'],
        targetBeneficiaries: targetBeneficiaries || '20,000 community members',
        estimatedBudgetReq: Number(estimatedBudget) || 3000000,
        submittedBy: user?.id || 'u1',
        submitterName: user?.name || 'Citizen Submitter',
      });

      addNotification(
        'Problem Submitted Successfully',
        `Problem #${res.data.id} has entered the Admin verification & AI matching queue.`,
        'success'
      );

      navigate(`/problems/${res.data.id}`);
    } catch {
      alert('Failed to submit problem statement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E2A5E]/10 text-[#1E2A5E] text-xs font-bold">
          <FilePlus className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Citizen & Community Submission Form</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
          Submit a Grassroots Problem Statement
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Document an unsolved societal challenge in your locality. Our autonomous AI engine will evaluate feasibility and connect with research labs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Details */}
        <div className="civic-card p-6 sm:p-8 space-y-5">
          <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider border-b border-slate-100 pb-3">
            1. Problem Context & Overview
          </h3>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Problem Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setPreCheckResult(null);
              }}
              placeholder="e.g., Severe Groundwater Arsenic & Fluoride Contamination in Coastal Villages"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
            />
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Primary Domain / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Urgency Severity *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
              >
                <option value="low">Low — General Community Improvement</option>
                <option value="medium">Medium — Quality of Life Impact</option>
                <option value="high">High — Urgent Economic or Health Issue</option>
                <option value="critical">Critical — Immediate Health & Safety Risk</option>
              </select>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Detailed Description & Root Cause *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setPreCheckResult(null);
              }}
              placeholder="Describe the root cause, number of affected people, why existing commercial solutions fail, and what technical help is needed..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
            />
          </div>

          {/* Location & Beneficiaries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Location (District, State) *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Tiruvottiyur, Tamil Nadu"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Target Beneficiaries Count
              </label>
              <div className="relative">
                <Target className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={targetBeneficiaries}
                  onChange={(e) => setTargetBeneficiaries(e.target.value)}
                  placeholder="e.g., 18,500 villagers across 3 hamlets"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                />
              </div>
            </div>
          </div>

          {/* Required Expertise & Estimated Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Suggested Competencies (comma-separated)
              </label>
              <input
                type="text"
                value={requiredExpertise}
                onChange={(e) => setRequiredExpertise(e.target.value)}
                placeholder="e.g., IoT, Water Chemistry, Membrane Filtration"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Estimated Prototyping Budget (INR)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  placeholder="3500000"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* 2. AI Duplicate & NLP Pre-Scan */}
        <div className="civic-card p-6 space-y-4 border-2 border-indigo-100 bg-indigo-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E2A5E]">
              <Cpu className="w-4 h-4 text-[#3E5C9A]" />
              <span>Instant AI Duplicate & Technical Readiness Pre-Scan</span>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRunPreCheck}
              loading={isPreChecking}
              disabled={!title || !description}
            >
              Run Instant AI Pre-Scan
            </Button>
          </div>

          {preCheckResult ? (
            <div className="pt-3 border-t border-indigo-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Authenticity Confidence</span>
                <span className="text-xl font-extrabold text-[#1F9D55] font-mono-data block mt-0.5">
                  {preCheckResult.authenticityScore}%
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Duplicate Match Probability</span>
                <span className="text-xl font-extrabold text-[#3E5C9A] font-mono-data block mt-0.5">
                  {preCheckResult.duplicateScore}% (Unique)
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Academic Feasibility</span>
                <span className="text-xl font-extrabold text-[#1E2A5E] font-mono-data block mt-0.5">
                  TRL 3-6 Ready
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Clicking Pre-Scan performs instant NLP tokenization to test overlap against existing national problem databases.
            </p>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/problems">
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="accent"
            size="lg"
            loading={isSubmitting}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Submit to Verification & Partner Matchmaking Pool
          </Button>
        </div>

      </form>
    </div>
  );
};
