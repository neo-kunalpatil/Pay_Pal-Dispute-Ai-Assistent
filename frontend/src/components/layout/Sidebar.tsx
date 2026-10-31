import React from 'react';
import { useApp } from '../../context/AppContext';
import { PayPalLogo } from '../common/PayPalLogo';
import { 
  Home, 
  CreditCard, 
  ShieldAlert, 
  FolderLock, 
  Sparkles, 
  Send, 
  BarChart3, 
  Link2, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ShoppingBag, 
  MessageSquare, 
  User, 
  Users, 
  Activity, 
  Database, 
  ShieldCheck, 
  ChevronRight,
  Store
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { 
    userRole, 
    activeTab, 
    setActiveTab, 
    disputes,
    setUserRole,
    logout
  } = useApp();

  const activeDisputesCount = disputes.filter(d => d.status === 'Needs Response' || d.status === 'Under Review').length;

  const merchantNavItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'disputes', label: 'Disputes', icon: ShieldAlert, badge: activeDisputesCount },
    { id: 'evidence', label: 'Evidence Center', icon: FolderLock },
    { id: 'ai-investigation', label: 'AI Investigation', icon: Sparkles, highlight: true },
    { id: 'response-center', label: 'Response Center', icon: Send },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'paypal-integration', label: 'PayPal Integration', icon: Link2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const buyerNavItems: NavItem[] = [
    { id: 'buyer-dashboard', label: 'Dashboard', icon: Home },
    { id: 'buyer-orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'disputes', label: 'Disputes', icon: ShieldAlert, badge: 1 },
    { id: 'buyer-messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Profile & Settings', icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: Home },
    { id: 'disputes', label: 'All Disputes', icon: ShieldAlert, badge: disputes.length },
    { id: 'admin-users', label: 'Users & Merchants', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'admin-audit', label: 'Audit Logs', icon: Database },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const analystNavItems: NavItem[] = [
    { id: 'analyst-dashboard', label: 'Investigation Queue', icon: Home },
    { id: 'disputes', label: 'Assigned Claims', icon: ShieldAlert, badge: activeDisputesCount },
    { id: 'evidence', label: 'Evidence Review', icon: FolderLock },
    { id: 'ai-investigation', label: 'AI Investigation', icon: Sparkles, highlight: true },
    { id: 'response-center', label: 'Response Drafts', icon: Send },
    { id: 'analytics', label: 'Resolution Trends', icon: BarChart3 },
  ];

  const currentNav = userRole === 'merchant' 
    ? merchantNavItems 
    : userRole === 'buyer' 
    ? buyerNavItems 
    : userRole === 'analyst'
    ? analystNavItems
    : adminNavItems;

  return (
    <aside className="w-64 bg-[#0A192F] text-white flex flex-col shrink-0 min-h-screen select-none border-r border-[#152B4D]">
      {/* Brand Header */}
      <div className="h-18 flex items-center px-6 gap-3 border-b border-[#152B4D]/60">
        <PayPalLogo className="h-7" showWordmark={true} white={true} />
        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#0070BA] text-white ml-auto">
          {userRole}
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {userRole === 'merchant' ? 'Workspace' : userRole === 'buyer' ? 'Customer Portal' : userRole === 'analyst' ? 'Analyst Queue' : 'Platform Control'}
        </div>

        {currentNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                isActive
                  ? 'bg-[#0070BA] text-white shadow-md shadow-[#0070BA]/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/6'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>

              {item.highlight && !isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              )}

              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white text-[#0070BA]' : 'bg-rose-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Extra Help link */}
        <div className="pt-4 border-t border-[#152B4D]/60 mt-4">
          <button
            onClick={() => setActiveTab('settings')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/6 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span>Help & Support</span>
          </button>
        </div>
      </div>

      {/* Bottom Promo Card matching image_6d1c2c37.png */}
      <div className="p-3">
        <div className="bg-gradient-to-br from-[#0070BA] to-[#00457C] rounded-xl p-3.5 text-white shadow-sm relative overflow-hidden group">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-xs font-bold leading-tight">
            Secure Payments.
          </h4>
          <p className="text-[11px] text-blue-100/90 leading-tight mb-2">
            Trusted by Millions.
          </p>
          <button 
            onClick={() => setActiveTab('paypal-integration')}
            className="text-[11px] font-bold text-white flex items-center gap-1 hover:underline"
          >
            <span>Learn More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* User profile / Logout */}
      <div className="p-3 border-t border-[#152B4D]/60 bg-[#071324] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#0070BA] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {userRole === 'merchant' ? 'A' : userRole === 'buyer' ? 'R' : 'AD'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {userRole === 'merchant' ? 'Acme Store' : userRole === 'buyer' ? 'Rahul Sharma' : 'Platform Admin'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {userRole === 'merchant' ? 'PayPal Business' : userRole === 'buyer' ? 'Verified Buyer' : 'Superadmin'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out & return to PayPal Home"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
