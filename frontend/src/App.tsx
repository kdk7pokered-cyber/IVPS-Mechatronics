import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';

import { LandingPage } from './pages/LandingPage';
import { NewMachinesPage } from './pages/NewMachinesPage';
import { UsedMachinesPage } from './pages/UsedMachinesPage';
import { MachineDetailPage } from './pages/MachineDetailPage';
import { SellMachinePage } from './pages/SellMachinePage';
import { ComparePage } from './pages/ComparePage';
import { WishlistPage } from './pages/WishlistPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [passedFilters, setPassedFilters] = useState<any>(null);
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  const [registerEmail, setRegisterEmail] = useState<string>('');

  const handleNavigate = (view: string, idOrParams?: any, filterState?: any, tab?: string) => {
    setCurrentView(view);

    if (typeof idOrParams === 'number') {
      setSelectedMachineId(idOrParams);
    } else if (idOrParams && typeof idOrParams === 'object' && idOrParams.email) {
      setRegisterEmail(idOrParams.email);
    }

    if (tab) {
      setDashboardTab(tab);
    } else if (typeof idOrParams === 'string') {
      setDashboardTab(idOrParams);
    }

    if (filterState) {
      setPassedFilters(filterState);
    } else {
      setPassedFilters(null);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CompareProvider>
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
              {/* Header */}
              <Navbar currentView={currentView} onNavigate={handleNavigate} />

              {/* Dynamic View Body */}
              <main className="flex-1">
                {currentView === 'landing' && (
                  <LandingPage onNavigate={handleNavigate} />
                )}

                {currentView === 'new-machines' && (
                  <NewMachinesPage
                    initialFilters={passedFilters}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'used-machines' && (
                  <UsedMachinesPage
                    initialFilters={passedFilters}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'machine-detail' && selectedMachineId && (
                  <MachineDetailPage
                    machineId={selectedMachineId}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'sell' && (
                  <SellMachinePage onNavigate={handleNavigate} />
                )}

                {currentView === 'compare' && (
                  <ComparePage onNavigate={handleNavigate} />
                )}

                {currentView === 'wishlist' && (
                  <WishlistPage onNavigate={handleNavigate} />
                )}

                {currentView === 'dashboard' && (
                  <DashboardPage
                    onNavigate={handleNavigate}
                    initialTab={dashboardTab}
                  />
                )}

                {currentView === 'login' && (
                  <LoginPage onNavigate={handleNavigate} />
                )}

                {currentView === 'register' && (
                  <RegisterPage
                    onNavigate={handleNavigate}
                    initialEmail={registerEmail}
                  />
                )}
              </main>

              {/* Mobile Bottom Navigation */}
              <MobileNav currentView={currentView} onNavigate={handleNavigate} />

              {/* Industrial Footer */}
              <Footer onNavigate={handleNavigate} />
            </div>
          </CompareProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
