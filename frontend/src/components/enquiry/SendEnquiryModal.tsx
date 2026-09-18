import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SendEnquiryModalProps {
  machineId: number;
  machineTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SendEnquiryModal: React.FC<SendEnquiryModalProps> = ({
  machineId,
  machineTitle,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [requirement, setRequirement] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [preferredContact, setPreferredContact] = useState('Email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to send an enquiry', 'info');
      return;
    }
    if (!message.trim()) {
      showToast('Please write your enquiry message', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.sendEnquiry({
        machine_id: machineId,
        name,
        email,
        phone,
        message,
        requirement,
        quantity,
        preferred_contact_method: preferredContact
      });
      setIsSuccess(true);
      showToast('Enquiry sent to the certified broker!', 'success');
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2200);
    } catch (err: any) {
      showToast(err.message || 'Error submitting enquiry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <span>Direct Commercial RFQ / Enquiry</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Enquiry Dispatched!</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Your message and specifications request have been delivered to the broker's verified dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Enquiring for: <strong className="text-white">{machineTitle}</strong>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98200 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Quantity Required</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Specific Technical Requirement (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Need 4th-axis probing, immediate dispatch to Pune plant"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Message / RFQ Details
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ask about inspection schedule, tooling accessories, shipping or quotation terms..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Preferred Response Method
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['Email', 'Phone', 'WhatsApp'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPreferredContact(method)}
                    className={`py-2 rounded-xl border font-semibold text-center transition ${
                      preferredContact === method
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Request...' : 'Submit Commercial Enquiry'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
