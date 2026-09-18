import React, { useState } from 'react';
import {
  Cog, ShieldCheck, Heart, Scale, PlusCircle, User as UserIcon,
  LogOut, LayoutDashboard, ChevronDown, Menu, X, Unlock, MessageSquare,
  DollarSign, CheckSquare, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, id?: number, filterState?: any, tab?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const { wishlistIds } = useWishlist();
  const { compareList } = useCompare();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent"></div>
                <Cog className="w-6 h-6 text-amber-400 group-hover:rotate-90 transition-transform duration-700" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-wider text-white">IVPS</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  MECHATRONICS
                </span>
              </div>
              <div className="text-[10px] tracking-[0.25em] font-semibold text-slate-400 uppercase -mt-1">
                HEAVY MACHINERY MARKETPLACE
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links - Strictly Role Based */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Common Public/Buyer Links */}
            {(!role || role === 'buyer') && (
              <>
                <button
                  onClick={() => onNavigate('landing')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    currentView === 'landing'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('new-machines')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    currentView === 'new-machines'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  New Machines
                </button>
                <button
                  onClick={() => onNavigate('used-machines')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    currentView === 'used-machines'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Second-Hand
                </button>
                <button
                  onClick={() => onNavigate('compare')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition relative ${
                    currentView === 'compare'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    Compare
                  </span>
                  {compareList.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {compareList.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onNavigate('wishlist')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition relative ${
                    currentView === 'wishlist'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    Saved
                  </span>
                  {wishlistIds.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {wishlistIds.length}
                    </span>
                  )}
                </button>
                {role === 'buyer' && (
                  <>
                    <button
                      onClick={() => onNavigate('dashboard', undefined, undefined, 'unlocks')}
                      className="px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-slate-900 rounded-lg transition flex items-center gap-1.5"
                    >
                      <Unlock className="w-4 h-4" />
                      Unlocked Contacts
                    </button>
                    <button
                      onClick={() => onNavigate('dashboard', undefined, undefined, 'enquiries')}
                      className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      My Enquiries
                    </button>
                  </>
                )}
              </>
            )}

            {/* Broker Navigation */}
            {role === 'broker' && (
              <>
                <button
                  onClick={() => onNavigate('dashboard', undefined, undefined, 'overview')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    currentView === 'dashboard'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Broker Dashboard
                  </span>
                </button>
                <button
                  onClick={() => onNavigate('dashboard', undefined, undefined, 'listings')}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition"
                >
                  My Machinery Listings
                </button>
                <button
                  onClick={() => onNavigate('sell')}
                  className="px-3 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/10 rounded-lg transition flex items-center gap-1.5 font-bold"
                >
                  <PlusCircle className="w-4 h-4" />
                  List a Machine
                </button>
                <button
                  onClick={() => onNavigate('dashboard', undefined, undefined, 'enquiries')}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Buyer RFQs
                </button>
                <button
                  onClick={() => onNavigate('new-machines')}
                  className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition"
                >
                  Browse Market
                </button>
              </>
            )}

            {/* Admin Navigation */}
            {role === 'admin' && (
              <>
                <button
                  onClick={() => onNavigate('dashboard', undefined, undefined, 'overview')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    currentView === 'dashboard'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Command
                  </span>
                </button>
                <button
                  onClick={() => onNavigate('dashboard', undefined, undefined, 'fees')}
                  className="px-3 py-2 text-sm font-bold text-amber-300 hover:bg-amber-500/10 rounded-lg transition flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  Fee Settings (₹)
                </button>
                <button
                  onClick={() => onNavigate('dashboard', undefined, undefined, 'pending')}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition flex items-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4" />
                  Moderation
                </button>
                <button
                  onClick={() => onNavigate('dashboard', undefined, undefined, 'transactions')}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition flex items-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  Unlock Ledger
                </button>
                <button
                  onClick={() => onNavigate('dashboard', undefined, undefined, 'users')}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  Brokers & Users
                </button>
              </>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Broker Action CTA: Only Brokers or Guests see List Machine */}
            {(!role || role === 'broker') && (
              <button
                onClick={() => onNavigate('sell')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List a Machine</span>
              </button>
            )}

            {/* Profile / Auth Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm transition"
                >
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-slate-200 leading-tight">{user.name}</div>
                    <div className="text-[10px] text-amber-400 font-mono capitalize">
                      {role === 'broker' ? 'Certified Broker' : role === 'admin' ? 'Super Admin' : 'Industrial Buyer'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Authenticated Account</p>
                      <p className="text-sm font-bold text-white truncate">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                          {role}
                        </span>
                        {user.is_google_verified ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 flex items-center gap-1 border border-blue-500/30">
                            ✓ Google Verified Email
                          </span>
                        ) : user.is_verified ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> OTP Verified
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-400" />
                      {role === 'admin'
                        ? 'Admin Control Console'
                        : role === 'broker'
                        ? 'Broker Management Portal'
                        : 'Buyer Hub & Unlocks'}
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        onNavigate('landing');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-900 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3.5 py-1.5 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition shadow-md shadow-amber-500/20"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onNavigate('sell')}
              className="p-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold"
              title="List a Machine"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('new-machines');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              New Machines
            </button>
            <button
              onClick={() => {
                onNavigate('used-machines');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              Second-Hand Machines
            </button>
            <button
              onClick={() => {
                onNavigate('compare');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              Compare ({compareList.length})
            </button>
            <button
              onClick={() => {
                onNavigate('wishlist');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              Saved ({wishlistIds.length})
            </button>

            {user ? (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-slate-900 rounded-lg font-bold"
                >
                  Dashboard ({user.name})
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-slate-900 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 text-center text-sm font-medium bg-slate-900 text-white rounded-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 text-center text-sm font-bold bg-amber-500 text-slate-950 rounded-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
