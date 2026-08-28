import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  FilePlus,
  Compass,
  UserCheck,
  GraduationCap,
  Building2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ConnectionThread } from '../ui/ConnectionThread';
import { StepperPipeline } from '../ui/StepperPipeline';
import { impactService } from '../../services/impactService';
import type { ImpactStats } from '../../types';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    impactService.getStats().then((res) => setStats(res.data));
  }, []);

  const roleCards = [
    {
      role: 'citizen',
      title: 'Citizen & NGO',
      badge: 'Submit Challenges',
      desc: 'Submit verified local challenges, rally community upvotes, and track automated AI matching directly from your dashboard.',
      icon: UserCheck,
      borderColor: 'hover:border-amber-400 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-50 text-amber-600',
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
      to: '/dashboard/citizen',
      cta: 'Submit Challenge',
    },
    {
      role: 'university',
      title: 'University R&D Lab',
      badge: 'Academic Solvers',
      desc: 'Discover problems matching your lab’s patents and equipment. Deploy student researcher taskforces with industry seed grant funding.',
      icon: GraduationCap,
      borderColor: 'hover:border-blue-400 hover:shadow-blue-500/10',
      iconBg: 'bg-blue-50 text-blue-600',
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
      to: '/dashboard/university',
      cta: 'Explore Grants & Matches',
    },
    {
      role: 'industry',
      title: 'Industry Sponsor',
      badge: 'Scale & Commercialize',
      desc: 'Co-fund high-potential TRL-6 university prototypes through CSR budgets, license verified IP, and deploy hardware across India.',
      icon: Building2,
      borderColor: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-50 text-indigo-600',
      badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      to: '/dashboard/industry',
      cta: 'Co-Fund Projects',
    },
    {
      role: 'admin',
      title: 'Governance & Admin',
      badge: 'Ecosystem Oversight',
      desc: 'AI duplicate moderation queue, platform analytics, regional deployment telemetry, and SDG metric reporting ledger.',
      icon: ShieldCheck,
      borderColor: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-50 text-emerald-600',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      to: '/dashboard/admin',
      cta: 'Governance Console',
    },
  ];

  return (
    <div className="space-y-16 py-4 animate-in fade-in duration-300">
      
      {/* ─── Hero Section: Crisp, High-Contrast & Premium ──────────────── */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-8 sm:p-14 shadow-2xl border border-slate-800 text-center space-y-8">
        
        {/* Glow Spheres */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-orange-300 text-xs font-bold tracking-wider backdrop-blur-md shadow-inner">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>AI-Powered National Problem-to-Partner Matchmaking Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] font-heading text-white">
            We don’t just collect problems.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 block sm:inline">
              We find the people who can solve them.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Bridging grassroots citizen challenges directly to University research laboratories and Industry CSR sponsors through autonomous capability vector alignment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/problems/new">
              <Button variant="accent" size="lg" icon={<FilePlus className="w-4 h-4" />}>
                Submit a Problem
              </Button>
            </Link>
            <Link to="/problems">
              <Button variant="glass" size="lg" icon={<Compass className="w-4 h-4" />}>
                Explore as Partner
              </Button>
            </Link>
          </div>
        </div>

        {/* Live-looking Stat Strip */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-8 border-t border-slate-800 max-w-4xl mx-auto text-left">
          {[
            { label: 'Total Problems', value: stats ? `${stats.totalProblems}+` : '328+', desc: 'Submitted nationwide' },
            { label: 'Verified by AI & Admin', value: stats ? `${stats.verifiedProblems}` : '241', desc: 'Passed ground checks' },
            { label: 'Active R&D Taskforces', value: stats ? `${stats.activeCollaborations}` : '47', desc: 'Univ + Industry paired' },
            { label: 'People Impacted', value: stats ? `${(stats.peopleImpacted / 1000).toFixed(0)}k+` : '186k+', desc: 'Verified beneficiaries' },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {item.label}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-data mt-1 block">
                {item.value}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{item.desc}</span>
            </div>
          ))}
        </div>

      </section>

      {/* ─── Signature Visual: Connection Thread ──────────────────────── */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-widest flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            The Autonomous Innovation Bridge
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            How The AI Matchmaker Connects Stakeholders
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Our multi-vector algorithm extracts required engineering competencies and pairs the problem with the exact University lab and Industry manufacturer.
          </p>
        </div>

        <ConnectionThread
          problemTitle="Groundwater Contamination & Salinity in Coastal Village"
          universityName="IIT Madras - Env. Engg Lab"
          industryName="GreenTech Solutions Ltd."
          matchScore={94}
        />
      </section>

      {/* ─── 6-Step End-to-End Pipeline ───────────────────────────────── */}
      <section className="civic-card p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            End-to-End Problem Solving Loop
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            From Community Issue to Real-World Deployed Impact
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Every submission moves transparently through this verified 7-stage pipeline.
          </p>
        </div>

        <StepperPipeline currentStage="build" />
      </section>

      {/* ─── Role-Based "Who is this for" ─────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Platform Roles & Portals
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Designed for Every Innovation Stakeholder
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Select your persona to enter your personalized dashboard and tool suite.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roleCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                className={`civic-card p-6 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between space-y-4 group ${card.borderColor}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs font-bold ${card.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${card.badgeStyle}`}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {card.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>

                <Link to={card.to} className="pt-2 block">
                  <Button variant="primary" size="sm" className="w-full justify-between group-hover:bg-slate-800">
                    <span>{card.cta}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Featured Success Stories (3 Cards) ────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
              Proven Field Results
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Featured Solution Deployments
            </h2>
          </div>
          <Link to="/impact" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <span>View Full Impact Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats?.successStories?.map((story) => (
            <div
              key={story.id}
              className="civic-card overflow-hidden group hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/95 text-slate-900 shadow-sm backdrop-blur-xs">
                  {story.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {story.partner}
                  </p>
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                    "{story.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {story.impact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA Banner ────────────────────────────────────────── */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
            Have a community challenge in your district?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Submit in under 2 minutes. Our AI matching engine will identify university researchers immediately.
          </p>
        </div>
        <Link to="/problems/new" className="shrink-0">
          <Button variant="accent" size="lg" icon={<Sparkles className="w-4 h-4" />}>
            Submit Problem Now
          </Button>
        </Link>
      </section>

    </div>
  );
};
