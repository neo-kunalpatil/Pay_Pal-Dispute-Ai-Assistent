import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Radio
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const { 
    userRole, 
    setUserRole, 
    activeTab, 
    setActiveTab, 
    notifications, 
    markNotificationsAsRead,
    sandboxMode,
    logout
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-18 bg-white border-b border-[#E5EAF0] px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Search Bar matching screenshot */}
      <div className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, customers..."
            className="w-full bg-[#F0F4F8] hover:bg-[#E8EFF6] focus:bg-white text-sm text-[#172B4D] pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-[#0070BA] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sandbox pill */}
        {sandboxMode && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Radio className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
            Sandbox Mode
          </span>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markNotificationsAsRead();
            }}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                <span className="text-[11px] text-[#0070BA] font-medium cursor-pointer hover:underline" onClick={markNotificationsAsRead}>
                  Mark all read
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer text-left">
                    <p className="text-xs font-medium text-slate-800">{n.title}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu matching screenshot ("K Kunal Patil" or "Acme Store") */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0070BA] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {userRole === 'merchant' ? 'K' : userRole === 'buyer' ? 'R' : 'A'}
            </div>
            <span className="text-sm font-semibold text-[#172B4D] hidden sm:inline">
              {userRole === 'merchant' ? 'Kunal Patil' : userRole === 'buyer' ? 'Rahul Sharma' : 'Admin'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">
                  {userRole === 'merchant' ? 'Kunal Patil (Acme Store)' : userRole === 'buyer' ? 'Rahul Sharma' : 'Superadmin'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {userRole === 'merchant' ? 'kunalpatil3435@gmail.com' : 'rahul.sharma@example.com'}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => { setActiveTab('paypal-integration'); setShowUserMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>PayPal Connection</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  Sign Out to PayPal Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
