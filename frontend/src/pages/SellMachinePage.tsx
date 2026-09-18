import React, { useState } from 'react';
import {
  PlusCircle, Trash2, Image as ImageIcon, ShieldCheck, CheckCircle2,
  AlertCircle, Upload, ArrowRight, Lock, DollarSign, ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface SellMachinePageProps {
  onNavigate: (view: string, id?: number) => void;
}

const CATEGORIES = [
  'CNC Machines', 'Lathe Machines', 'Milling Machines', 'Drilling Machines',
  'Hydraulic Machines', 'Welding Machines', 'Construction Equipment',
  'Agricultural Machinery', 'Industrial Compressors', 'Generators',
  'Heavy Equipment', 'Electrical Machines', 'Manufacturing Equipment', 'Other Machinery'
];

const CONDITIONS = ['Brand New', 'Excellent', 'Very Good', 'Good', 'Fair', 'Needs Maintenance'];

export const SellMachinePage: React.FC<SellMachinePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Basic info
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [listingType, setListingType] = useState<'new' | 'second_hand'>('second_hand');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [condition, setCondition] = useState(CONDITIONS[1]);
  const [usageHours, setUsageHours] = useState<number>(1200);

  // Dynamic specifications
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Spindle Power', value: '25 kW' },
    { key: 'Operating Voltage', value: '415 V' },
    { key: 'Load Capacity', value: '1500 kg' }
  ]);

  // Pricing in ₹ INR
  const [price, setPrice] = useState<number | ''>(2500000);
  const [negotiable, setNegotiable] = useState(true);
  const [contactUnlockFee, setContactUnlockFee] = useState<number | ''>('');

  // Location
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('Pune');
  const [address, setAddress] = useState('');

  // Description
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState('');
  const [serviceHistory, setServiceHistory] = useState('');
  const [reasonForSelling, setReasonForSelling] = useState('');
  const [includedAccessories, setIncludedAccessories] = useState('');

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Broker info
  const [brokerName, setBrokerName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.company || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification that user is allowed to list
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Broker Authentication Required</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Industrial equipment listings on IVPS Mechatronics are restricted to registered and verified Brokers. Please sign in or create a broker account to continue.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('login')}
            className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold rounded-xl text-xs transition"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Register as Broker
          </button>
        </div>
      </div>
    );
  }

  // Strict role check: Buyers CANNOT list machines
  if (user.role === 'buyer') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Broker Portal Restricted</h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          You are currently signed in as an <strong className="text-blue-400">Industrial Buyer</strong> ({user.email}).
          Only certified and registered <strong className="text-amber-400">Brokers</strong> are authorized to post machinery listings on IVPS Mechatronics.
        </p>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto text-xs text-slate-400 text-left space-y-1.5">
          <div className="font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Buyer Capabilities:
          </div>
          <p>• Browse verified New & Second-Hand heavy machinery</p>
          <p>• Unlock direct broker contact numbers & WhatsApp links</p>
          <p>• Request technical quotes and equipment inspections</p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('new-machines')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Browse Industrial Machines
          </button>
        </div>
      </div>
    );
  }

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !manufacturer.trim() || !model.trim() || !price || !description.trim()) {
      showToast('Please complete all required machinery listing fields', 'error');
      return;
    }

    const specsDict: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsDict[s.key.trim()] = s.value.trim();
      }
    });

    const payload = {
      title,
      category,
      listing_type: listingType,
      manufacturer,
      model,
      year: Number(year),
      condition: listingType === 'new' ? 'Brand New' : condition,
      usage_hours: listingType === 'new' ? 0 : Number(usageHours),
      price: Number(price),
      negotiable,
      contact_unlock_fee: contactUnlockFee ? Number(contactUnlockFee) : undefined,
      country,
      state,
      city,
      address,
      description,
      history,
      service_history: serviceHistory,
      reason_for_selling: reasonForSelling,
      included_accessories: includedAccessories,
      specifications: specsDict,
      images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'],
      availability: 'In Stock'
    };

    setIsSubmitting(true);
    try {
      const created = await api.createMachine(payload);
      showToast('Machine published successfully! Awaiting verification or live on marketplace.', 'success');
      onNavigate('machine-detail', created.id);
    } catch (err: any) {
      showToast(err.message || 'Error publishing machinery listing', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          Certified Broker Listing Portal
        </div>
        <h1 className="text-3xl font-black text-white">List an Industrial Machine</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Publish industrial, mechanical, electrical, or heavy manufacturing equipment to verified industrial buyers across India.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
            Machine Details & Classification
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Machine Title / Model Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Haas VF-2 30-Tool High Speed Machining Center"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Marketplace Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setListingType('second_hand')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                      listingType === 'second_hand'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Second-Hand
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingType('new')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                      listingType === 'new'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Brand New
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Manufacturer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haas, Mazak, Caterpillar"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Model Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VF-2 / 320D"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Manufacturing Year *
                </label>
                <input
                  type="number"
                  required
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {listingType === 'second_hand' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Condition Grade
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Operating Usage Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3500"
                    value={usageHours}
                    onChange={(e) => setUsageHours(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Technical Specifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
              Dynamic Engineering Specifications
            </h2>
            <button
              type="button"
              onClick={handleAddSpec}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Specification
            </button>
          </div>

          <div className="space-y-3">
            {specs.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Parameter (e.g. Spindle Speed)"
                  value={s.key}
                  onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 12,000 RPM)"
                  value={s.value}
                  onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Commercial Terms & Location in ₹ INR */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">3</span>
            Commercial Terms & Location (₹ INR)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Asking Price (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-bold text-amber-400">₹</span>
                <input
                  type="number"
                  required
                  min="1000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-amber-400 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Contact Unlock Fee Override (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Platform default (₹99)"
                value={contactUnlockFee}
                onChange={(e) => setContactUnlockFee(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={negotiable}
                onChange={(e) => setNegotiable(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-800 bg-slate-950 focus:ring-0"
              />
              <span>Price is Negotiable for Direct Industrial Buyers</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Plant / Workshop Inspection Address (Confidential until unlock)
            </label>
            <input
              type="text"
              placeholder="e.g. Plot 42, Bhosari MIDC Industrial Area"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Section 4: Machine Description & Biography */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">4</span>
            Machine Biography & Operational Details
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Machine Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Detail the machine capabilities, mechanical condition, controls, and recent maintenance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl p-4 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Service & Maintenance History
              </label>
              <textarea
                rows={2}
                placeholder="Log of regular OEM servicing, spindle overhauls, oil changes..."
                value={serviceHistory}
                onChange={(e) => setServiceHistory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Reason for Selling
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Facility expansion, production line replacement..."
                value={reasonForSelling}
                onChange={(e) => setReasonForSelling(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Machine Photographs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">5</span>
            Machinery Photographs
          </h2>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
            >
              Add Photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {imageUrls.map((img, idx) => (
              <div key={idx} className="relative h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:text-white transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Broker Verification Details (Protected via Contact Unlock System) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">6</span>
              Broker Verification Details
            </h2>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Protected by Paid Unlock
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300">
            🔒 <strong>Broker Privacy Guarantee</strong>: Your direct phone number and WhatsApp contact are never displayed publicly. Buyers must pay the platform contact unlock fee before accessing your private details.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Broker / Agent Full Name
              </label>
              <input
                type="text"
                required
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Brokerage Firm / Company
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Direct Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                WhatsApp Business Number
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-2xl shadow-amber-500/30 transition flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Publishing Machine...' : 'Publish Machinery Listing'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[11px] text-slate-500 text-center mt-3">
            IVPS Mechatronics ensures professional commercial transactions with encrypted broker contact protection.
          </p>
        </div>
      </form>
    </div>
  );
};
