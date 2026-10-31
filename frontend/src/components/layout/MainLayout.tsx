import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HomePage } from '../../pages/HomePage';
import { AuthModal } from '../auth/AuthModal';
import { Overview } from '../../pages/Overview';
import { Disputes } from '../../pages/Disputes';
import { DisputeDetails } from '../../pages/DisputeDetails';
import { EvidenceCenter } from '../../pages/EvidenceCenter';
import { AIInvestigation } from '../../pages/AIInvestigation';
import { ResponseCenter } from '../../pages/ResponseCenter';
import { Transactions } from '../../pages/Transactions';
import { Analytics } from '../../pages/Analytics';
import { PayPalIntegration } from '../../pages/PayPalIntegration';
import { Settings } from '../../pages/Settings';
import { BuyerDashboard } from '../../pages/BuyerDashboard';
import { AdminDashboard } from '../../pages/AdminDashboard';
import { AnalystDashboard } from '../../pages/AnalystDashboard';
import { Login } from '../../pages/Login';

export const MainLayout: React.FC = () => {
  const { 
    isAuthenticated, 
    activeTab, 
    userRole, 
    isAuthModalOpen, 
    setIsAuthModalOpen,
    authModalMode,
    authModalRole 
  } = useApp();

  // If not authenticated or on home tab, render standard PayPal homepage
  if (!isAuthenticated || activeTab === 'home') {
    return (
      <>
        <HomePage />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          initialRole={authModalRole}
        />
      </>
    );
  }

  // If user explicitly navigated to full login page
  if (activeTab === 'login') {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'disputes':
        return <Disputes />;
      case 'dispute-details':
        return <DisputeDetails />;
      case 'evidence':
        return <EvidenceCenter />;
      case 'ai-investigation':
        return <AIInvestigation />;
      case 'response-center':
        return <ResponseCenter />;
      case 'transactions':
        return <Transactions />;
      case 'analytics':
        return <Analytics />;
      case 'paypal-integration':
        return <PayPalIntegration />;
      case 'settings':
        return <Settings />;
      case 'buyer-dashboard':
      case 'buyer-orders':
      case 'buyer-messages':
        return <BuyerDashboard />;
      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-audit':
        return <AdminDashboard />;
      case 'analyst-dashboard':
        return <AnalystDashboard />;
      default:
        return userRole === 'buyer' 
          ? <BuyerDashboard /> 
          : userRole === 'admin' 
          ? <AdminDashboard /> 
          : userRole === 'analyst'
          ? <AnalystDashboard />
          : <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F6F8FB] overflow-hidden text-[#172B4D]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Topbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global Auth Modal if triggered from within */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
      />
    </div>
  );
};
