import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Unlock, Lock, MessageSquare, CreditCard, ShieldCheck,
  CheckCircle2, XCircle, Clock, PlusCircle, ArrowUpRight, Phone,
  Mail, MessageCircle, MapPin, Eye, Users, DollarSign, RefreshCw,
  Settings, CheckSquare, Edit2, Save
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EnquiryItem, FeeSettingsResponse, UnlockTransactionItem } from '../types';

interface DashboardPageProps {
  onNavigate: (view: string, id?: number, filterState?: any, tab?: string) => void;
  initialTab?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, initialTab = 'overview' }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [pendingMachines, setPendingMachines] = useState<any[]>([]);
  const [allMachines, setAllMachines] = useState<any[]>([]);
  const [receivedEnquiries, setReceivedEnquiries] = useState<EnquiryItem[]>([]);
  const [sentEnquiries, setSentEnquiries] = useState<EnquiryItem[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fee management state (Admin)
  const [feeSettings, setFeeSettings] = useState<FeeSettingsResponse | null>(null);
  const [platformFeeInput, setPlatformFeeInput] = useState<number>(99);
  const [updatingPlatformFee, setUpdatingPlatformFee] = useState(false);
  const [unlockTransactions, setUnlockTransactions] = useState<UnlockTransactionItem[]>([]);
  const [totalUnlockRevenue, setTotalUnlockRevenue] = useState<number>(0);

  // Per-machine fee editing state
  const [selectedMachineForFee, setSelectedMachineForFee] = useState<number | ''>('');
  const [customMachineFeeInput, setCustomMachineFeeInput] = useState<number | ''>('');
  const [updatingMachineFee, setUpdatingMachineFee] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchDashboard = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const summary = await api.getDashboardSummary();
      setSummaryData(summary);

      if (user.role === 'admin') {
        const [pendingRes, usersRes, feeRes, txRes, machinesRes] = await Promise.all([
          api.getPendingMachines(),
          api.getAdminUsers(),
          api.getFeeSettings(),
          api.getUnlockTransactions(),
          api.listMachines({ page_size: 50 })
        ]);
        setPendingMachines(pendingRes.items);
        setAllUsers(usersRes);
        setFeeSettings(feeRes);
        setPlatformFeeInput(feeRes.default_contact_unlock_fee);
        setUnlockTransactions(txRes.items);
        setTotalUnlockRevenue(txRes.total_revenue);
        setAllMachines(machinesRes.items);
      } else if (user.role === 'broker') {
        const enq = await api.getReceivedEnquiries();
        setReceivedEnquiries(enq);
      } else {
        const enqSent = await api.getSentEnquiries();
        setSentEnquiries(enqSent);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const handleModerate = async (machineId: number, status: string) => {
    try {
      await api.moderateMachine(machineId, status);
      showToast(`Machine listing marked as '${status}'`, 'success');
      setPendingMachines((prev) => prev.filter((m) => m.id !== machineId));
      fetchDashboard();
    } catch (err: any) {
      showToast(err.message || 'Error moderating machine', 'error');
    }
  };

  const handleToggleVerifyUser = async (userId: number) => {
    try {
      const res = await api.verifyUser(userId);
      showToast(`User verification status updated to ${res.is_verified ? 'VERIFIED' : 'UNVERIFIED'}`, 'info');
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified: res.is_verified } : u))
      );
    } catch (err: any) {
      showToast(err.message || 'Error updating user verification', 'error');
    }
  };

  const handleSavePlatformFee = async () => {
    if (platformFeeInput < 0) {
      showToast('Fee cannot be negative', 'error');
      return;
    }
    setUpdatingPlatformFee(true);
    try {
      const res = await api.updatePlatformFee(platformFeeInput);
      showToast(res.message, 'success');
      setFeeSettings((prev) => prev ? { ...prev, default_contact_unlock_fee: platformFeeInput } : null);
    } catch (err: any) {
      showToast(err.message || 'Error updating platform fee', 'error');
    } finally {
      setUpdatingPlatformFee(false);
    }
  };

  const handleSaveMachineFee = async () => {
    if (!selectedMachineForFee) {
      showToast('Select a machine first', 'error');
      return;
    }
    setUpdatingMachineFee(true);
    try {
      const feeVal = customMachineFeeInput === '' ? null : Number(customMachineFeeInput);
      const res = await api.updateMachineFee(Number(selectedMachineForFee), feeVal);
      showToast(res.message, 'success');
      setSelectedMachineForFee('');
      setCustomMachineFeeInput('');
      fetchDashboard();
    } catch (err: any) {
      showToast(err.message || 'Error updating machine fee', 'error');
    } finally {
      setUpdatingMachineFee(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Please Sign In to Access Your Portal</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  const role = user.role;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner with User Greeting & Role Details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover border border-amber-500/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-xl flex items-center justify-center border border-amber-500/30">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase border ${
                role === 'admin'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : role === 'broker'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}>
                {role === 'broker' ? 'Certified Broker' : role === 'admin' ? 'Super Admin' : 'Industrial Buyer'}
              </span>
              {user.is_google_verified ? (
                <span className="text-xs text-blue-300 font-bold flex items-center gap-1 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> ✓ Google Verified Email
                </span>
              ) : user.is_verified ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {user.company ? `${user.company} • ` : ''}
              <span className="font-semibold text-slate-300">{user.email}</span>
              {user.is_google_verified && (
                <span className="text-blue-400 ml-1.5 font-semibold text-[11px]">(Google Identity)</span>
              )}
              {user.phone ? ` • ${user.phone}` : ''}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {(role === 'broker' || role === 'admin') && (
          <button
            onClick={() => onNavigate('sell')}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            List a Machine
          </button>
        )}
      </div>

      {/* ====================================================================== */}
      {/* 1. ADMIN DASHBOARD & CONTROLS                                          */}
      {/* ====================================================================== */}
      {role === 'admin' && summaryData?.stats && (
        <div className="space-y-8">
          {/* Admin Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'overview' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview & KPIs
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'fees' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Contact Unlock Fee Settings (₹)
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Moderation Queue ({pendingMachines.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'transactions' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              Unlock Ledger ({unlockTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Brokers & Users ({allUsers.length})
            </button>
          </div>

          {/* Admin KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" /> Total Accounts
              </div>
              <div className="text-2xl font-black text-white">{summaryData.stats.total_users}</div>
              <div className="text-[10px] text-slate-500">{summaryData.stats.active_sellers} Active Brokers</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-emerald-400" /> Approved Machinery
              </div>
              <div className="text-2xl font-black text-emerald-400">{summaryData.stats.approved_listings}</div>
              <div className="text-[10px] text-slate-500">
                {summaryData.stats.new_machines} New / {summaryData.stats.used_machines} Second-Hand
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-400" /> Pending Moderation
              </div>
              <div className="text-2xl font-black text-rose-400">{summaryData.stats.pending_listings}</div>
              <div className="text-[10px] text-slate-500">Awaiting Admin Action</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-400" /> Unlock Revenue
              </div>
              <div className="text-2xl font-black text-amber-400">
                ₹{totalUnlockRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500">{unlockTransactions.length} Paid Unlocks</div>
            </div>
          </div>

          {/* TAB: CONTACT UNLOCK FEE SETTINGS (CRITICAL BUSINESS REQUIREMENT) */}
          {(activeTab === 'fees' || activeTab === 'overview') && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">
                    Contact Unlock Fee Configuration
                  </h2>
                </div>
                <span className="text-xs text-amber-400 font-mono">Currency: ₹ INR</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Global Default Fee Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Platform Default Unlock Fee</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Applied across all machines unless overridden per machine.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-sm">
                      Current: ₹{feeSettings?.default_contact_unlock_fee || 99}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-sm font-bold text-amber-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={platformFeeInput}
                        onChange={(e) => setPlatformFeeInput(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none font-mono font-bold"
                      />
                    </div>
                    <button
                      onClick={handleSavePlatformFee}
                      disabled={updatingPlatformFee}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{updatingPlatformFee ? 'Updating...' : 'Update Default Fee'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Per-Machine Custom Fee Override */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Per-Machine Custom Fee Override</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Set a custom unlock fee for high-value equipment or leave empty to use platform default.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <select
                      value={selectedMachineForFee}
                      onChange={(e) => {
                        const mId = e.target.value ? Number(e.target.value) : '';
                        setSelectedMachineForFee(mId);
                        if (mId) {
                          const m = allMachines.find((x) => x.id === mId);
                          setCustomMachineFeeInput(m?.contact_unlock_fee || '');
                        } else {
                          setCustomMachineFeeInput('');
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="">Select a Machine Listing ({allMachines.length})</option>
                      {allMachines.map((m) => (
                        <option key={m.id} value={m.id}>
                          #{m.id} - {m.title} (Fee: ₹{m.contact_unlock_fee || 'Default ₹99'})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2 text-sm font-bold text-amber-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Override fee (or empty for default)"
                          value={customMachineFeeInput}
                          onChange={(e) => setCustomMachineFeeInput(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleSaveMachineFee}
                        disabled={updatingMachineFee || !selectedMachineForFee}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>Save Custom Fee</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: UNLOCK TRANSACTIONS LEDGER */}
          {(activeTab === 'transactions' || activeTab === 'overview') && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">
                    Contact Unlock Transactions Ledger ({unlockTransactions.length})
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Unlocks Revenue: </span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    ₹{totalUnlockRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {unlockTransactions.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">No contact unlocks processed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Transaction</th>
                        <th className="p-3">Buyer</th>
                        <th className="p-3">Broker</th>
                        <th className="p-3">Machine Listing</th>
                        <th className="p-3">Fee Paid</th>
                        <th className="p-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {unlockTransactions.map((tx) => (
                        <tr key={tx.unlock_id} className="hover:bg-slate-950/40">
                          <td className="p-3 font-mono text-amber-400">#UL-{tx.unlock_id}</td>
                          <td className="p-3">
                            <div className="text-white font-bold">{tx.buyer_name}</div>
                            <div className="text-slate-400 text-[11px]">{tx.buyer_email}</div>
                          </td>
                          <td className="p-3 text-slate-300 font-semibold">{tx.broker_name}</td>
                          <td className="p-3 text-white max-w-[200px] truncate">{tx.machine_title}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            ₹{tx.amount.toFixed(0)} {tx.currency}
                          </td>
                          <td className="p-3 text-right text-slate-400 font-mono text-[11px]">
                            {new Date(tx.unlocked_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: MODERATION QUEUE */}
          {(activeTab === 'pending' || activeTab === 'overview') && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">
                    Listing Moderation Queue ({pendingMachines.length})
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Review & approve listings before public visibility</span>
              </div>

              {pendingMachines.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  All machinery submissions are up to date!
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMachines.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img
                          src={m.primary_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80'}
                          alt={m.title}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <div className="text-sm font-bold text-white line-clamp-1">{m.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {m.category} • Broker: <strong className="text-amber-400">{m.broker_name}</strong> ({m.broker_email})
                          </div>
                          <div className="text-xs font-bold text-amber-400 mt-1">
                            ₹{m.price.toLocaleString('en-IN')} • {m.condition}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleModerate(m.id, 'approved')}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerate(m.id, 'rejected')}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-xs font-bold transition"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => onNavigate('machine-detail', m.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                          title="Inspect full specs"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: USERS & BROKERS DIRECTORY */}
          {(activeTab === 'users' || activeTab === 'overview') && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
                Registered Platform Directory ({allUsers.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Mobile Phone</th>
                      <th className="p-3">Verification</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-950/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {u.profile_image ? (
                              <img src={u.profile_image} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-700" />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px]">
                                {u.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white">{u.name}</div>
                              <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                                <span>{u.email}</span>
                                {u.is_google_verified && (
                                  <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-0.5">
                                    ✓ Google
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-semibold uppercase text-amber-400">
                          {u.role === 'broker' ? 'Broker' : u.role === 'admin' ? 'Admin' : 'Buyer'}
                        </td>
                        <td className="p-3 text-slate-300">{u.company || '-'}</td>
                        <td className="p-3 font-mono text-slate-300">{u.phone || '-'}</td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1 items-start">
                            {u.is_google_verified && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 text-[10px] flex items-center gap-1">
                                ✓ Google Verified Email
                              </span>
                            )}
                            {u.is_verified ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">
                                Unverified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleVerifyUser(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition"
                          >
                            {u.is_verified ? 'Revoke Status' : 'Grant Verified'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 2. BROKER DASHBOARD VIEW                                               */}
      {/* ====================================================================== */}
      {role === 'broker' && summaryData?.stats && (
        <div className="space-y-8">
          {/* Broker KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Total Machinery</div>
              <div className="text-2xl font-black text-white">{summaryData.stats.total_machines}</div>
              <div className="text-[10px] text-emerald-400">{summaryData.stats.active_listings} Active Listings</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Moderation Status</div>
              <div className="text-2xl font-black text-amber-400">{summaryData.stats.pending_approval}</div>
              <div className="text-[10px] text-slate-500">Awaiting Admin Verification</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Buyer RFQs Received</div>
              <div className="text-2xl font-black text-white">{summaryData.stats.enquiries_received}</div>
              <div className="text-[10px] text-slate-500">Direct Inquiries</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Contact Unlocks</div>
              <div className="text-2xl font-black text-amber-400">{summaryData.stats.contact_unlocks_count}</div>
              <div className="text-[10px] text-slate-500">Verified buyers unlocked direct mobile</div>
            </div>
          </div>

          {/* Broker Machinery Inventory */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">My Machinery Portfolio</h2>
              <button
                onClick={() => onNavigate('sell')}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ List New Equipment</span>
              </button>
            </div>

            <div className="space-y-3">
              {(summaryData.machines || []).map((m: any) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.primary_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80'}
                      alt={m.title}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-bold text-white text-sm line-clamp-1">{m.title}</div>
                      <div className="text-xs text-slate-400">
                        {m.category} • ₹{m.price.toLocaleString('en-IN')} • Unlock Fee: ₹{m.contact_unlock_fee || 99}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                      m.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {m.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => onNavigate('machine-detail', m.id)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                      title="View machine listing"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enquiries Received */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
              Received Commercial RFQs ({receivedEnquiries.length})
            </h2>

            {receivedEnquiries.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No RFQ enquiries received yet.</p>
            ) : (
              <div className="space-y-3">
                {receivedEnquiries.map((eq) => (
                  <div key={eq.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white">{eq.name}</div>
                      <span className="text-[10px] text-amber-400 uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                        Preferred: {eq.preferred_contact_method}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Machinery: <strong className="text-white">{eq.machine_title}</strong> (Quantity: {eq.quantity})
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      "{eq.message}"
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Email: <a href={`mailto:${eq.email}`} className="text-amber-400 underline">{eq.email}</a></span>
                      {eq.phone && <span>Phone: <a href={`tel:${eq.phone}`} className="text-amber-400 underline">{eq.phone}</a></span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 3. BUYER DASHBOARD VIEW                                                */}
      {/* ====================================================================== */}
      {role === 'buyer' && summaryData?.stats && (
        <div className="space-y-8">
          {/* Buyer KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Saved in Wishlist</div>
              <div className="text-2xl font-black text-white">{summaryData.stats.saved_machines_count}</div>
              <button onClick={() => onNavigate('wishlist')} className="text-[10px] text-amber-400 underline">
                Open Saved Machines
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Unlocked Broker Contacts</div>
              <div className="text-2xl font-black text-emerald-400">{summaryData.stats.unlocked_contacts_count}</div>
              <div className="text-[10px] text-slate-500">Direct Mobile & WhatsApp Access</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Enquiries Dispatched</div>
              <div className="text-2xl font-black text-white">{summaryData.stats.enquiries_sent_count}</div>
              <div className="text-[10px] text-slate-500">Commercial RFQs</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Total Spent on Unlocks</div>
              <div className="text-2xl font-black text-amber-400">
                ₹{summaryData.stats.total_spent_on_unlocks?.toFixed(0) || '0'}
              </div>
              <div className="text-[10px] text-slate-500">Authorized Contact Fees</div>
            </div>
          </div>

          {/* UNLOCKED BROKER CONTACTS LIST (CRITICAL BUYER ASSET) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  Unlocked Broker Contacts ({summaryData.unlocked_contacts?.length || 0})
                </h2>
              </div>
              <span className="text-xs text-emerald-400 font-bold">Direct Dial & WhatsApp Ready</span>
            </div>

            {(!summaryData.unlocked_contacts || summaryData.unlocked_contacts.length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <Lock className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
                <p>You haven't unlocked any broker contacts yet.</p>
                <p>When you unlock a machinery listing, direct broker mobile numbers and WhatsApp links will appear here permanently.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaryData.unlocked_contacts.map((u: any) => (
                  <div
                    key={u.unlock_id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{u.broker_name}</div>
                        <div className="text-xs text-slate-400">{u.broker_company || 'Certified Broker'}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        ✓ Unlocked
                      </span>
                    </div>

                    <div className="text-xs text-amber-300 font-medium line-clamp-1">
                      Machine: {u.machine_title} (₹{u.price?.toLocaleString('en-IN')})
                    </div>

                    {/* Direct Contact Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {u.broker_phone && (
                        <a
                          href={`tel:${u.broker_phone}`}
                          className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Broker</span>
                        </a>
                      )}

                      {(u.broker_whatsapp || u.broker_phone) && (
                        <a
                          href={`https://wa.me/${(u.broker_whatsapp || u.broker_phone || '').replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div className="space-y-1 text-xs pt-2 border-t border-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Mobile:</span>
                        <span className="font-mono font-bold text-white">{u.broker_phone}</span>
                      </div>
                      {u.broker_email && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Email:</span>
                          <a href={`mailto:${u.broker_email}`} className="text-amber-400 truncate max-w-[180px]">
                            {u.broker_email}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onNavigate('machine-detail', u.machine_id)}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1"
                      >
                        <span>View Machinery Listing</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enquiries Sent */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
              My Sent RFQ Enquiries ({sentEnquiries.length})
            </h2>

            {sentEnquiries.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No enquiries sent yet.</p>
            ) : (
              <div className="space-y-3">
                {sentEnquiries.map((eq) => (
                  <div key={eq.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-white">{eq.machine_title}</strong>
                      <span className="text-emerald-400 font-bold uppercase">{eq.status}</span>
                    </div>
                    <p className="text-xs text-slate-300">"{eq.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
