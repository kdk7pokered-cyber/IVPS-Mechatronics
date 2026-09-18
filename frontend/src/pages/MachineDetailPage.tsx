import React, { useState, useEffect } from 'react';
import {
  Heart, Scale, MapPin, Calendar, Clock, ShieldCheck, Lock, Unlock,
  CheckCircle2, ChevronLeft, Phone, Mail, MessageSquare, Tag,
  ExternalLink, ZoomIn, Eye, Sparkles, MessageCircle, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { MachineDetailData, UnlockedBrokerContact } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { UnlockPaymentModal } from '../components/payment/UnlockPaymentModal';
import { SendEnquiryModal } from '../components/enquiry/SendEnquiryModal';

interface MachineDetailPageProps {
  machineId: number;
  onNavigate: (view: string, id?: number) => void;
}

export const MachineDetailPage: React.FC<MachineDetailPageProps> = ({ machineId, onNavigate }) => {
  const [machine, setMachine] = useState<MachineDetailData | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const { isSaved, toggleWishlist } = useWishlist();
  const { isCompared, addToCompare } = useCompare();

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const data = await api.getMachineDetail(machineId);
        setMachine(data);
      } catch (err) {
        console.error('Error loading machine detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [machineId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-xs">Loading machine technical dossier...</p>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Machine Profile Not Found</h2>
        <p className="text-xs text-slate-400">The listing may have been sold or removed by the broker.</p>
        <button
          onClick={() => onNavigate('new-machines')}
          className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const saved = isSaved(machine.id);
  const compared = isCompared(machine.id);

  const handleUnlockedSuccess = (contact: UnlockedBrokerContact) => {
    setMachine((prev) => (prev ? { ...prev, is_contact_unlocked: true, unlocked_contact: contact } : null));
    setUnlockModalOpen(false);
  };

  const images = machine.images.length > 0
    ? machine.images
    : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'];

  const unlockFee = machine.contact_unlock_fee || 99;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Navigation Breadcrumb */}
      <button
        onClick={() => onNavigate(machine.listing_type === 'new' ? 'new-machines' : 'used-machines')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold transition group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to {machine.listing_type === 'new' ? 'New Machines' : 'Second-Hand Machines'}</span>
      </button>

      {/* Top Header: Title, Badges, Price in INR, CTAs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wide border border-amber-500/30">
              {machine.category}
            </span>
            {machine.listing_type === 'new' ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-xs uppercase">
                NEW MACHINE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30">
                Grade: {machine.condition}
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              {machine.views_count} views
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
            {machine.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span>Manufacturer: <strong className="text-white">{machine.manufacturer}</strong></span>
            <span>•</span>
            <span>Model: <strong className="text-white">{machine.model}</strong></span>
            <span>•</span>
            <span>Year: <strong className="text-white">{machine.year}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {machine.city}, {machine.state}, {machine.country}
            </span>
          </div>
        </div>

        {/* Pricing & Quick Buttons */}
        <div className="lg:text-right space-y-3 flex-shrink-0">
          <div>
            <div className="text-xs text-slate-400">
              Asking Price {machine.negotiable && <span className="text-amber-400 font-semibold">(Negotiable)</span>}
            </div>
            <div className="text-3xl font-black text-amber-400">
              ₹{machine.price.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center lg:justify-end gap-2">
            <button
              onClick={() => toggleWishlist(machine.id)}
              className={`p-2.5 rounded-xl border transition ${
                saved
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
              title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => addToCompare(machine as any)}
              className={`p-2.5 rounded-xl border transition ${
                compared
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
              title="Add to compare matrix"
            >
              <Scale className="w-5 h-5" />
            </button>

            <button
              onClick={() => setEnquiryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Send Enquiry
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Left Column (Gallery + Specs + Description) vs Right Column (Broker Contact Box & Profile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery Component */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4">
            {/* Active Image */}
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-950 group">
              <img
                src={images[activeImageIndex]}
                alt={`${machine.title} - View ${activeImageIndex + 1}`}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white transition"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setIsZoomed(false);
                    }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                      activeImageIndex === idx ? 'border-amber-500 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Technical Specifications Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Technical Specifications</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <tbody>
                  <tr className="border-b border-slate-800/80">
                    <th className="py-3 px-4 font-semibold text-slate-400 w-1/3 bg-slate-950/40">Marketplace Category</th>
                    <td className="py-3 px-4 text-white font-medium capitalize">{machine.listing_type.replace('_', ' ')}</td>
                  </tr>
                  <tr className="border-b border-slate-800/80">
                    <th className="py-3 px-4 font-semibold text-slate-400 bg-slate-950/40">Condition</th>
                    <td className="py-3 px-4 text-white font-medium">{machine.condition}</td>
                  </tr>
                  <tr className="border-b border-slate-800/80">
                    <th className="py-3 px-4 font-semibold text-slate-400 bg-slate-950/40">Operating Usage</th>
                    <td className="py-3 px-4 text-white font-medium">
                      {machine.listing_type === 'new' ? '0 Hours (Brand New)' : `${machine.usage_hours.toLocaleString()} Hours`}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-800/80">
                    <th className="py-3 px-4 font-semibold text-slate-400 bg-slate-950/40">Availability</th>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{machine.availability}</td>
                  </tr>

                  {/* Dynamic Custom Specs from Broker */}
                  {Object.entries(machine.specifications || {}).map(([key, value]) => (
                    <tr key={key} className="border-b border-slate-800/80">
                      <th className="py-3 px-4 font-semibold text-slate-400 bg-slate-950/40">{key}</th>
                      <td className="py-3 px-4 text-amber-300 font-medium">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Machine Biography & Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
              Machine Biography & Technical Overview
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>{machine.description}</p>

              {machine.history && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    Operating History & Past Applications
                  </h4>
                  <p className="text-xs text-slate-300">{machine.history}</p>
                </div>
              )}

              {machine.service_history && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    Maintenance Logs & Inspections
                  </h4>
                  <p className="text-xs text-slate-300">{machine.service_history}</p>
                </div>
              )}

              {machine.included_accessories && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    Included Tooling & Accessories
                  </h4>
                  <p className="text-xs text-slate-300">{machine.included_accessories}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Protected Broker Contact & Info Box */}
        <div className="space-y-6">
          {/* PAID BROKER CONTACT SYSTEM BOX */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Broker Contact
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                machine.is_contact_unlocked
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {machine.is_contact_unlocked ? '✓ Unlocked' : '🔒 Locked'}
              </span>
            </div>

            {/* UNLOCKED STATE */}
            {machine.is_contact_unlocked && machine.unlocked_contact ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Broker Contact Unlocked</span>
                  </div>
                  <div className="text-lg font-black text-white">
                    {machine.unlocked_contact.broker_name}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {machine.unlocked_contact.company || 'Certified Machinery Broker'}
                  </div>
                </div>

                {/* Call Broker & WhatsApp Broker Actions */}
                <div className="grid grid-cols-2 gap-2.5">
                  {machine.unlocked_contact.phone && (
                    <a
                      href={`tel:${machine.unlocked_contact.phone}`}
                      className="py-3 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Broker</span>
                    </a>
                  )}

                  {(machine.unlocked_contact.whatsapp || machine.unlocked_contact.phone) && (
                    <a
                      href={`https://wa.me/${(machine.unlocked_contact.whatsapp || machine.unlocked_contact.phone || '').replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Broker</span>
                    </a>
                  )}
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-xs pt-2 border-t border-slate-800">
                  {machine.unlocked_contact.phone && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-400" /> Phone:
                      </span>
                      <a href={`tel:${machine.unlocked_contact.phone}`} className="font-mono font-bold text-white hover:text-amber-400">
                        {machine.unlocked_contact.phone}
                      </a>
                    </div>
                  )}

                  {machine.unlocked_contact.email && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-400" /> Email:
                      </span>
                      <a href={`mailto:${machine.unlocked_contact.email}`} className="font-mono text-white hover:text-amber-400 truncate max-w-[160px]">
                        {machine.unlocked_contact.email}
                      </a>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                      Inspection Plant Address
                    </span>
                    <span>
                      {machine.unlocked_contact.address ? `${machine.unlocked_contact.address}, ` : ''}
                      {machine.unlocked_contact.city}, {machine.unlocked_contact.state}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* LOCKED STATE (CRITICAL BUSINESS REQUIREMENT) */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Lock className="w-4 h-4" />
                    <span>Contact Locked</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pay the contact access fee to get the broker's contact details.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">Contact Unlock Fee:</span>
                  <span className="text-xl font-black text-amber-400">
                    ₹{unlockFee.toFixed(0)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      onNavigate('login');
                    } else {
                      setUnlockModalOpen(true);
                    }
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 group"
                >
                  <Unlock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Pay ₹{unlockFee.toFixed(0)} & Get Broker Contact</span>
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  Private cell numbers and WhatsApp links remain strictly confidential until access authorization.
                </p>
              </div>
            )}
          </div>

          {/* Broker Entity Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black flex items-center justify-center text-base">
                {machine.broker_name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{machine.broker_name}</span>
                  {machine.broker_verified && (
                    <span title="Verified Broker">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{machine.broker_company || 'Certified Industrial Broker'}</div>
              </div>
            </div>

            <button
              onClick={() => setEnquiryModalOpen(true)}
              className="w-full py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Send Quotation Request (RFQ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Unlock Modal */}
      <UnlockPaymentModal
        machineId={machine.id}
        machineTitle={machine.title}
        brokerName={machine.broker_name}
        brokerCompany={machine.broker_company}
        unlockFee={unlockFee}
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onUnlocked={handleUnlockedSuccess}
      />

      {/* Send Enquiry Modal */}
      <SendEnquiryModal
        machineId={machine.id}
        machineTitle={machine.title}
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
      />
    </div>
  );
};
