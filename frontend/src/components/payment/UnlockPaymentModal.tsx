import React, { useState } from 'react';
import {
  X, ShieldCheck, Lock, Unlock, CreditCard, CheckCircle2,
  AlertCircle, MessageCircle, Phone, Mail, MapPin, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { UnlockedBrokerContact } from '../../types';
import { useToast } from '../../context/ToastContext';

interface UnlockPaymentModalProps {
  machineId: number;
  machineTitle: string;
  brokerName: string;
  brokerCompany?: string;
  unlockFee: number;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: (contact: UnlockedBrokerContact) => void;
}

export const UnlockPaymentModal: React.FC<UnlockPaymentModalProps> = ({
  machineId,
  machineTitle,
  brokerName,
  brokerCompany = 'Certified Machinery Brokerage',
  unlockFee = 99.0,
  isOpen,
  onClose,
  onUnlocked
}) => {
  const [step, setStep] = useState<'checkout' | 'processing' | 'success' | 'failed' | 'cancelled'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'credit_card' | 'netbanking'>('upi');
  const [simulationChoice, setSimulationChoice] = useState<'success' | 'failed' | 'cancelled'>('success');
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [unlockedContact, setUnlockedContact] = useState<UnlockedBrokerContact | null>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleInitiateAndPay = async () => {
    setStep('processing');
    try {
      // 1. Initiate unlock order on backend (in ₹ INR)
      const initRes = await api.initiateUnlock(machineId, paymentMethod);
      setPaymentId(initRes.payment_id);
      setTransactionId(initRes.transaction_id);

      // Simulate network latency for payment gateway communication (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 2. Server-side verification & unlock with selected simulation outcome
      const verifyRes = await api.verifyUnlock(initRes.payment_id, simulationChoice);

      if (verifyRes.success && verifyRes.contact) {
        setStep('success');
        setUnlockedContact(verifyRes.contact);
        onUnlocked(verifyRes.contact);
        showToast('✓ Broker contact unlocked successfully!', 'success');
      } else if (verifyRes.status === 'cancelled') {
        setStep('cancelled');
        setErrorMessage(verifyRes.message || 'Transaction was cancelled.');
        showToast('Payment cancelled', 'info');
      } else {
        setStep('failed');
        setErrorMessage(verifyRes.message || 'Payment declined by bank authority.');
        showToast('Payment failed: ' + (verifyRes.message || 'Declined'), 'error');
      }
    } catch (err: any) {
      setStep('failed');
      setErrorMessage(err.message || 'Could not complete contact unlock transaction.');
      showToast(err.message || 'Transaction error', 'error');
    }
  };

  const handleReset = () => {
    setStep('checkout');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>IVPS Mechatronics Contact Unlock</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CHECKOUT SCREEN */}
        {step === 'checkout' && (
          <div className="p-6 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <Lock className="w-3.5 h-3.5" />
                Verified Broker Contact Protection
              </div>
              <h2 className="text-xl font-black text-white">Unlock Broker Contact Details</h2>
              <p className="text-xs text-slate-400 mt-1">
                Pay the contact access fee to get the broker's direct phone number, WhatsApp link, and physical inspection address.
              </p>
            </div>

            {/* Target Machine & Broker Summary */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div>
                <span className="text-slate-400 text-[11px] block">Machine Listing</span>
                <div className="text-sm font-bold text-white line-clamp-1">{machineTitle}</div>
              </div>
              <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-800/80">
                <span>Broker: <strong className="text-amber-400">{brokerName}</strong></span>
                <span className="text-slate-400">{brokerCompany}</span>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
              <div>
                <div className="text-xs text-slate-400 font-medium">Contact Access Fee</div>
                <div className="text-2xl font-black text-amber-400">₹{unlockFee.toFixed(0)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Total Payable: ₹{unlockFee.toFixed(0)} (INR)</div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <div className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Instant Unlock
                </div>
                <div className="text-slate-400 mt-0.5">Lifetime listing access</div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'credit_card'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Debit / Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'netbanking'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Gateway Simulation Controls for Evaluation Testing */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Gateway Simulation Outcome (For Verification Testing)
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSimulationChoice('success')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                    simulationChoice === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Test Success
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationChoice('failed')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                    simulationChoice === 'failed'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Test Decline
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationChoice('cancelled')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                    simulationChoice === 'cancelled'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Test Cancel
                </button>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleInitiateAndPay}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 group"
            >
              <span>Pay ₹{unlockFee.toFixed(0)} & Get Broker Contact</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* STEP 2: PROCESSING SCREEN */}
        {step === 'processing' && (
          <div className="p-10 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Communicating with Banking Gateway...</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Processing ₹{unlockFee.toFixed(0)} payment authorization and issuing broker contact verification token.
            </p>
            <div className="text-[11px] text-amber-400 font-mono">
              Status: Payment Pending Verification
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS SCREEN WITH CALL & WHATSAPP BUTTONS */}
        {step === 'success' && unlockedContact && (
          <div className="p-6 space-y-5 animate-fadeIn">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <Unlock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">✓ Broker Contact Unlocked</h3>
              <p className="text-xs text-emerald-400 mt-0.5">
                Payment verified. Transaction ID: {transactionId || 'IVPS-TX-VERIFIED'}
              </p>
            </div>

            {/* Unlocked Broker Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-base font-black text-white">{unlockedContact.broker_name}</div>
                  <div className="text-xs text-slate-400">{unlockedContact.company || 'Certified Industrial Broker'}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Verified Broker
                </span>
              </div>

              {/* Direct Actions: Call Broker & WhatsApp Broker */}
              <div className="grid grid-cols-2 gap-3">
                {unlockedContact.phone && (
                  <a
                    href={`tel:${unlockedContact.phone}`}
                    className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Broker</span>
                  </a>
                )}

                {(unlockedContact.whatsapp || unlockedContact.phone) && (
                  <a
                    href={`https://wa.me/${(unlockedContact.whatsapp || unlockedContact.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Broker</span>
                  </a>
                )}
              </div>

              {/* Detail list */}
              <div className="space-y-2 text-xs pt-1">
                {unlockedContact.phone && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Mobile Number:</span>
                    <span className="text-white font-mono font-bold">{unlockedContact.phone}</span>
                  </div>
                )}

                {unlockedContact.email && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Email Address:</span>
                    <a href={`mailto:${unlockedContact.email}`} className="text-white hover:text-amber-400">
                      {unlockedContact.email}
                    </a>
                  </div>
                )}

                <div className="flex items-start justify-between py-1">
                  <span className="text-slate-400">Inspection Address:</span>
                  <span className="text-slate-200 text-right">
                    {unlockedContact.address ? `${unlockedContact.address}, ` : ''}
                    {unlockedContact.city}, {unlockedContact.state}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Done & Return to Listing
            </button>
          </div>
        )}

        {/* STEP 4: FAILURE OR CANCELLED SCREEN */}
        {(step === 'failed' || step === 'cancelled') && (
          <div className="p-8 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {step === 'failed' ? 'Payment Authorization Failed' : 'Transaction Cancelled'}
            </h3>
            <p className="text-xs text-rose-300 max-w-xs mx-auto">
              {errorMessage || 'The banking institution declined the transaction or checkout was aborted.'}
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
