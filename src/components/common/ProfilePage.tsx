import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  Mail,
  Building,
  Award,
  ShieldCheck,
  LogOut,
  MapPin,
  Edit3,
  Check,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
];

export const ProfilePage: React.FC = () => {
  const { user, role, logout, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [sector, setSector] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setOrganization(user.organization || user.org || user.companyName || user.department || '');
      setLocation(user.location || 'Chennai, Tamil Nadu');
      setSector(user.sector || 'Water & Environmental Engineering');
      setAvatar(user.avatar || avatarPresets[0]);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      organization,
      org: organization,
      location,
      sector,
      avatar,
    });
    setIsEditing(false);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setOrganization(user.organization || user.org || user.companyName || '');
      setLocation(user.location || 'Chennai, Tamil Nadu');
      setSector(user.sector || 'Water & Environmental Engineering');
      setAvatar(user.avatar || avatarPresets[0]);
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
            Account & Institution Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your personal profile, institutional credentials, and civic reputation score.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isEditing ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsEditing(true)}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Edit Profile Details
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="md"
              onClick={handleCancel}
            >
              Cancel Editing
            </Button>
          )}
        </div>
      </div>

      {isSavedRecently && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#1F9D55]" />
          <span>Profile changes successfully updated across the national platform!</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="civic-card p-6 sm:p-8 space-y-6">
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-6">
          <div className="relative group">
            <img
              src={avatar || avatarPresets[0]}
              alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#1E2A5E]/10 shadow-sm"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center text-white backdrop-blur-xs">
                <Camera className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-[#1E2A5E] font-heading">{user?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF6B4A]/10 text-[#FF6B4A] uppercase tracking-wider">
                {role} Persona
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600">
              {user?.organization || user?.org || user?.companyName || 'Independent Contributor'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {user?.location || 'Chennai, Tamil Nadu'}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* ─── VIEW MODE: Read-Only Grid ─────────────────────────────── */}
        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </span>
                <p className="font-semibold text-[#1E2A5E]">{user?.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Reputation Score
                </span>
                <p className="font-extrabold text-[#1F9D55] font-mono-data text-sm">
                  {user?.reputationPoints || 1200} Reputation Points
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> Affiliated Institution
                </span>
                <p className="font-semibold text-[#1E2A5E]">
                  {user?.organization || user?.org || user?.companyName || 'National Innovation Network'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Primary Domain Sector
                </span>
                <p className="font-semibold text-[#1E2A5E]">
                  {user?.sector || 'Water & Environmental Engineering'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Base Region
                </span>
                <p className="font-semibold text-[#1E2A5E]">{user?.location || 'Chennai, Tamil Nadu'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Account Verification
                </span>
                <p className="font-bold text-[#1F9D55]">Verified Ecosystem Contributor</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                To access another persona, sign out and sign in with the target role.
              </span>

              <Button
                variant="secondary"
                size="md"
                onClick={logout}
                icon={<LogOut className="w-4 h-4 text-rose-600" />}
              >
                Sign Out / Switch Role
              </Button>
            </div>
          </div>
        ) : (
          /* ─── EDIT MODE: Interactive Form ────────────────────────────── */
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Avatar Selection Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Choose Profile Avatar
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {avatarPresets.map((presetUrl, idx) => (
                  <img
                    key={idx}
                    src={presetUrl}
                    alt={`Avatar ${idx + 1}`}
                    onClick={() => setAvatar(presetUrl)}
                    className={`w-12 h-12 rounded-xl object-cover cursor-pointer transition ring-2 ${
                      avatar === presetUrl
                        ? 'ring-[#FF6B4A] scale-105 shadow-md'
                        : 'ring-transparent opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Anitha Rao"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. anitha.rao@iitm.ac.in"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Institution / Department / Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. IIT Madras - Env. Engineering Lab"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Location (City / State)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai, Tamil Nadu"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block font-bold text-slate-700">Primary Domain / Area of Focus</label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="e.g. Water Quality, IoT Sensors, Nanofiltration"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E]"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="accent"
                size="md"
                icon={<Sparkles className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
};
