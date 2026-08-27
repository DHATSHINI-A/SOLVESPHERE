import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import {
  Sparkles,
  UserCheck,
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterRoute = location.pathname === '/register';
  const [isLoginMode, setIsLoginMode] = useState(!isRegisterRoute);

  const [selectedRole, setSelectedRole] = useState<Role>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('ravi.kumar@citizen.org');
  const [password, setPassword] = useState('password123');
  const [orgOrDept, setOrgOrDept] = useState('');
  const [sector, setSector] = useState('Water Technology');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const roleOptions: { role: Role; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      role: 'citizen',
      label: 'Citizen / NGO',
      desc: 'Submit & track community problem statements.',
      icon: UserCheck,
    },
    {
      role: 'university',
      label: 'University R&D',
      desc: 'Faculty labs, student developers & grant matching.',
      icon: GraduationCap,
    },
    {
      role: 'industry',
      label: 'Industry Sponsor',
      desc: 'CSR funding, tech transfer & commercial scaling.',
      icon: Building2,
    },
    {
      role: 'admin',
      label: 'Admin Governance',
      desc: 'Verify statements & platform oversight.',
      icon: ShieldCheck,
    },
  ];

  const handleRoleChange = (r: Role) => {
    setSelectedRole(r);
    if (r === 'citizen') {
      setEmail('ravi.kumar@citizen.org');
      setName('Ravi Kumar');
    } else if (r === 'university') {
      setEmail('anitha.rao@iitm.ac.in');
      setName('Dr. Anitha Rao');
      setOrgOrDept('IIT Madras - Env. Engg Lab');
    } else if (r === 'industry') {
      setEmail('contact@greentechsolutions.io');
      setName('GreenTech Solutions Ltd.');
      setOrgOrDept('GreenTech Innovations');
    } else if (r === 'admin') {
      setEmail('admin@solutionhub.gov.in');
      setName('Admin Officer (Governance)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorBanner('Please fill in both email and password.');
      return;
    }

    login(selectedRole, name || undefined, orgOrDept || undefined);
    navigate(`/dashboard/${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col justify-center items-center px-4 py-12">
      
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <Link to="/" className="inline-flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-2xl bg-[#1E2A5E] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-[#FF6B4A]" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight text-[#1E2A5E] font-heading block">
              SolutionHub
            </span>
            <p className="text-[10px] text-[#6B7280] font-bold tracking-wider uppercase">
              Problem–Partner Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Authentication Card */}
      <div className="w-full max-w-xl civic-card p-8 sm:p-10 space-y-6 shadow-xl">
        
        {/* Mode Toggle Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <h2 className="text-xl font-bold text-[#1E2A5E] font-heading">
            {isLoginMode ? 'Sign In to Your Portal' : 'Create Ecosystem Account'}
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(true);
                setErrorBanner(null);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isLoginMode ? 'bg-[#1E2A5E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(false);
                setErrorBanner(null);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isLoginMode ? 'bg-[#1E2A5E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorBanner && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Persona Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roleOptions.map((opt) => {
                const isSelected = selectedRole === opt.role;
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.role}
                    onClick={() => handleRoleChange(opt.role)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50/60 border-[#1E2A5E] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-[#1E2A5E] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E2A5E]">{opt.label}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conditional Registration Fields */}
          {!isLoginMode && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Full Name / Org Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Anitha Rao"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
                  />
                </div>
              </div>

              {/* Conditional for University */}
              {selectedRole === 'university' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">University Department & Lab Name *</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={orgOrDept}
                      onChange={(e) => setOrgOrDept(e.target.value)}
                      placeholder="e.g. IIT Madras - Env. Engineering Lab"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
                    />
                  </div>
                </div>
              )}

              {/* Conditional for Industry */}
              {selectedRole === 'industry' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={orgOrDept}
                      onChange={(e) => setOrgOrDept(e.target.value)}
                      placeholder="e.g. GreenTech Solutions Ltd."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Industry Sector</label>
                    <input
                      type="text"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="e.g. CleanTech, Water Tech"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email & Password */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@institution.edu"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {isLoginMode && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link simulated: Please check your inbox.')}
                    className="text-[11px] text-[#3E5C9A] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center shadow-md text-sm"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {isLoginMode
              ? `Enter ${selectedRole.toUpperCase()} Portal`
              : `Create Account & Access ${selectedRole.toUpperCase()} Portal`}
          </Button>

        </form>

      </div>

      <p className="text-xs text-slate-400 mt-6 font-medium text-center">
        SolutionHub · National Civic-Trust & Innovation Bridge
      </p>
    </div>
  );
};
