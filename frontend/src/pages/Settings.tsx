import React, { useState, useEffect } from 'react';
import { 
  Building, 
  User, 
  Users, 
  Bell, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  CheckCircle2,
  UserPlus,
  Mail,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'ai' | 'notifications' | 'team'>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Server state
  const [businessName, setBusinessName] = useState('');
  const [merchantEmail, setMerchantEmail] = useState('');
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState('USD');
  const [businessType, setBusinessType] = useState('Ecommerce');
  const [autoDraft, setAutoDraft] = useState(true);
  const [minConfidence, setMinConfidence] = useState('75');
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Team state
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; full_name: string; email: string; role: string; is_active: boolean }>>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'analyst' | 'merchant'>('analyst');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const [settingsData, usersData] = await Promise.allSettled([
          api.getSettings ? api.getSettings() : fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/settings`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('disputepilot_token')}` }
          }).then(r => r.ok ? r.json() : null),
          api.getUsers()
        ]);

        if (settingsData.status === 'fulfilled' && settingsData.value) {
          const s = settingsData.value;
          setBusinessName(s.businessName || '');
          setMerchantEmail(s.email || s.notificationEmail || '');
          setCountry(s.country || 'US');
          setCurrency(s.currency || 'USD');
          setBusinessType(s.businessType || 'Ecommerce');
          setAutoDraft(s.autoInvestigate ?? true);
          setMinConfidence(String(Math.round((s.aiConfidenceThreshold || 0.75) * 100)));
        }
        if (usersData.status === 'fulfilled' && Array.isArray(usersData.value)) {
          setTeamMembers(usersData.value);
        }
      } catch (err) {
        console.warn('Settings load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const token = localStorage.getItem('disputepilot_token');
      const payload = {
        businessName,
        currency,
        autoInvestigate: autoDraft,
        aiConfidenceThreshold: parseInt(minConfidence) / 100,
        notificationEmail: merchantEmail
      };
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setInviteResult(null);
    try {
      await api.inviteUser(inviteEmail.trim(), inviteRole);
      setInviteResult(`✓ Invitation sent to ${inviteEmail.trim()} as ${inviteRole}.`);
      setInviteEmail('');
    } catch (err: any) {
      setInviteResult(`Error: ${err.message || 'Could not send invitation.'}`);
    } finally {
      setIsInviting(false);
    }
  };

  const tabBtn = (tab: typeof activeTab, Icon: React.ElementType, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
        activeTab === tab
          ? 'border-[#0070BA] text-[#0070BA]'
          : 'border-transparent text-slate-600 hover:text-slate-900'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Platform Settings</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage your merchant organization profile, AI model preferences, and dispute alerting rules.
          </p>
        </div>
        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
            <span>{saveError}</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {tabBtn('profile', User, 'Merchant Profile')}
        {tabBtn('business', Building, 'Business Information')}
        {tabBtn('ai', Sparkles, 'AI Investigation Preferences')}
        {tabBtn('team', Users, 'Team Members')}
        {tabBtn('notifications', Bell, 'Notifications')}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#0070BA]" />
          <span>Loading settings from server...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-6 shadow-xs max-w-3xl">
          <form onSubmit={handleSave} className="space-y-5">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#172B4D]">Merchant User Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Account Email</label>
                    <input
                      type="email"
                      value={merchantEmail}
                      onChange={(e) => setMerchantEmail(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Default Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none"
                    >
                      <option value="USD">USD – US Dollar</option>
                      <option value="EUR">EUR – Euro</option>
                      <option value="GBP">GBP – British Pound</option>
                      <option value="INR">INR – Indian Rupee</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#172B4D]">Business Entity Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Legal Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none"
                    >
                      <option>Ecommerce</option>
                      <option>SaaS / Digital Goods</option>
                      <option>Marketplace</option>
                      <option>Retail</option>
                      <option>Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      readOnly
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#172B4D]">AI Investigation Configuration</h3>
                <p className="text-xs text-slate-500">
                  Configure autonomous document indexing, threshold confidence scores, and multi-agent reasoning behaviors.
                </p>
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoDraft}
                      onChange={(e) => setAutoDraft(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#0070BA] rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Auto-generate Rebuttal Drafts upon Dispute Ingestion
                      </span>
                      <span className="text-xs text-slate-500">
                        When a PayPal dispute webhook arrives, immediately execute the 5-stage agent workflow to prepare a first draft.
                      </span>
                    </div>
                  </label>
                  <div className="p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">
                        Minimum Evidence Match Threshold: {minConfidence}%
                      </span>
                      <span className="text-[11px] text-slate-400">Strict Compliance Mode</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={minConfidence}
                      onChange={(e) => setMinConfidence(e.target.value)}
                      className="w-full accent-[#0070BA]"
                    />
                  </div>
                  <div className="p-3 rounded-xl border border-blue-100 bg-blue-50 text-xs text-blue-700">
                    <strong>Active Engine:</strong> LangGraph 5-node pipeline · gemini-3.5-flash-lite · pgvector 384-dim · Neon PostgreSQL
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-[#172B4D]">Dispute Operations Team</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {teamMembers.length === 0 ? (
                    <div className="p-4 text-slate-400 text-center">No team members found.</div>
                  ) : (
                    teamMembers.map(member => (
                      <div key={member.id} className="p-3.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 block">{member.full_name}</span>
                          <span className="text-slate-500 text-[11px]">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            member.role === 'merchant' ? 'bg-[#0070BA] text-white' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                          {!member.is_active && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">Inactive</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Invite New Member */}
                <div className="pt-2">
                  <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#0070BA]" />
                    Invite New Team Member
                  </h4>
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none text-xs"
                        required
                      />
                    </div>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'analyst' | 'merchant')}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:border-[#0070BA] focus:outline-none text-xs"
                    >
                      <option value="analyst">Dispute Analyst</option>
                      <option value="merchant">Merchant Owner</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isInviting}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isInviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                      Send Invite
                    </button>
                  </form>
                  {inviteResult && (
                    <p className={`mt-2 text-xs font-medium ${inviteResult.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {inviteResult}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#172B4D]">Alert Preferences</h3>
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#0070BA] rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Urgent Deadline Alerts (Within 3 Days)
                    </span>
                    <span className="text-xs text-slate-500">
                      Receive high-priority email alerts when a PayPal dispute requires evidence within 72 hours.
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Submit CTA */}
            {activeTab !== 'team' && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
