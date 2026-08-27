import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-[#1A1D29] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E2A5E] flex items-center justify-center text-white font-bold shadow">
              <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
            </div>
            <span className="font-extrabold text-xl text-[#1E2A5E] font-heading">SolutionHub</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            National Problem-Solving & AI Matchmaking Engine uniting Citizens, Universities, Industry Partners, and Government Bodies.
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-[#1E2A5E] font-bold bg-[#1E2A5E]/5 border border-[#1E2A5E]/15 px-2.5 py-1 rounded-md w-fit">
            <span className="w-2 h-2 rounded-full bg-[#1F9D55] animate-ping" />
            <span>AI Matchmaker Engine: Operational</span>
          </div>
        </div>

        {/* Platform Modules */}
        <div>
          <h4 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-wider mb-3">
            Platform Modules
          </h4>
          <ul className="space-y-2 text-xs font-medium text-slate-600">
            <li><Link to="/problems" className="hover:text-[#FF6B4A] transition">National Problem Directory</Link></li>
            <li><Link to="/problems/new" className="hover:text-[#FF6B4A] transition">Submit a Problem</Link></li>
            <li><Link to="/impact" className="hover:text-[#FF6B4A] transition">Public Impact Dashboard</Link></li>
            <li><Link to="/collaboration/c1" className="hover:text-[#FF6B4A] transition">Collaboration Workspaces</Link></li>
          </ul>
        </div>

        {/* Persona Portals */}
        <div>
          <h4 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-wider mb-3">
            Persona Portals
          </h4>
          <ul className="space-y-2 text-xs font-medium text-slate-600">
            <li><Link to="/dashboard/citizen" className="hover:text-[#FF6B4A] transition">Citizen / NGO Hub</Link></li>
            <li><Link to="/dashboard/university" className="hover:text-[#FF6B4A] transition">University R&D Portal</Link></li>
            <li><Link to="/dashboard/industry" className="hover:text-[#FF6B4A] transition">Industry Sponsor Console</Link></li>
            <li><Link to="/dashboard/admin" className="hover:text-[#FF6B4A] transition">Admin Moderation Console</Link></li>
          </ul>
        </div>

        {/* System Tech & Specs */}
        <div>
          <h4 className="text-xs font-bold text-[#1E2A5E] uppercase tracking-wider mb-3">
            Architecture & Trust
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Aligned with UN SDGs (Goal 2, 3, 6, 7, 11). Powered by multi-vector AI capability matching & live field telemetry.
          </p>
          <div className="flex items-center space-x-3 text-xs text-slate-700 font-semibold">
            <span className="flex items-center space-x-1"><Shield className="w-3.5 h-3.5 text-[#1E2A5E]" /> <span>Verified Ledger</span></span>
            <span className="flex items-center space-x-1"><Cpu className="w-3.5 h-3.5 text-[#3E5C9A]" /> <span>Edge AI Match</span></span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 SolutionHub National Innovation Ecosystem. All rights reserved.</p>
        <p className="flex items-center space-x-1 mt-2 sm:mt-0">
          <span>Bridging Problems to Partners</span>
          <Heart className="w-3.5 h-3.5 text-[#FF6B4A] fill-[#FF6B4A]" />
        </p>
      </div>
    </footer>
  );
};
