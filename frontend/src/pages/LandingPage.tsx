import React, { useState, useEffect } from 'react';
import {
  Search, ShieldCheck, ArrowRight, Cog, Wrench, CheckCircle2,
  Cpu, Disc, Layers, Anchor, Activity, Flame, Truck, Wheat, Wind,
  Zap, Box, Settings, Sparkles, Filter, ChevronRight, Lock, PhoneCall
} from 'lucide-react';
import { api } from '../services/api';
import { MachineCardData, CategorySummary } from '../types';
import { MachineCard } from '../components/machines/MachineCard';

interface LandingPageProps {
  onNavigate: (view: string, id?: number, filterState?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [featuredNew, setFeaturedNew] = useState<MachineCardData[]>([]);
  const [featuredUsed, setFeaturedUsed] = useState<MachineCardData[]>([]);
  const [recentMachines, setRecentMachines] = useState<MachineCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catsRes, newRes, usedRes, recentRes] = await Promise.all([
          api.getCategoriesSummary(),
          api.listMachines({ listing_type: 'new', page_size: 4 }),
          api.listMachines({ listing_type: 'second_hand', page_size: 4 }),
          api.listMachines({ sort_by: 'newest', page_size: 4 })
        ]);
        setCategories(catsRes);
        setFeaturedNew(newRes.items);
        setFeaturedUsed(usedRes.items);
        setRecentMachines(recentRes.items);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('new-machines', undefined, {
      q: searchQuery,
      listing_type: selectedType || undefined,
      category: selectedCat || undefined
    });
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-6 h-6 text-amber-400" />;
      case 'Disc': return <Disc className="w-6 h-6 text-amber-400" />;
      case 'Layers': return <Layers className="w-6 h-6 text-amber-400" />;
      case 'Anchor': return <Anchor className="w-6 h-6 text-amber-400" />;
      case 'Activity': return <Activity className="w-6 h-6 text-amber-400" />;
      case 'Flame': return <Flame className="w-6 h-6 text-amber-400" />;
      case 'Truck': return <Truck className="w-6 h-6 text-amber-400" />;
      case 'Wheat': return <Wheat className="w-6 h-6 text-amber-400" />;
      case 'Wind': return <Wind className="w-6 h-6 text-amber-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-400" />;
      case 'Box': return <Box className="w-6 h-6 text-amber-400" />;
      case 'Cog': return <Cog className="w-6 h-6 text-amber-400" />;
      default: return <Settings className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-24 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden industrial-gradient-hero border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/40 text-amber-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              India's Premier Heavy Machinery B2B Exchange
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Find the Right Machine. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300">
                Build the Future.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Discover, compare and connect with certified machinery brokers, dealers, and equipment specialists through <strong className="text-white">IVPS Mechatronics</strong>.
            </p>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('new-machines')}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition transform active:scale-95"
              >
                Browse New Machines
              </button>
              <button
                onClick={() => onNavigate('used-machines')}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm shadow-lg transition"
              >
                Browse Second-Hand Machines
              </button>
              <button
                onClick={() => onNavigate('sell')}
                className="px-6 py-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/40 text-amber-400 font-bold text-sm transition"
              >
                Sell Your Machine
              </button>
            </div>
          </div>

          {/* Prominent Search Bar & Quick Filters Box */}
          <div className="mt-12 max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-md">
            <form onSubmit={handleHeroSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search machines, models, manufacturers (e.g. Haas CNC, Mazak, Cat 320D, Atlas Copco)..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Equipment</span>
                </button>
              </div>

              {/* Quick Filter Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Segments (New & Used)</option>
                  <option value="new">New Machines</option>
                  <option value="second_hand">Second-Hand</option>
                </select>

                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => onNavigate('new-machines', undefined, { min_year: 2020 })}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-left transition"
                >
                  Year: 2020 & Newer
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('new-machines', undefined, { location: 'Pune' })}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-left transition"
                >
                  Location: Pune & Maharashtra
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. MAIN CATEGORIES GRID (14 Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">
              Industrial Classifications
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Explore Machinery by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('new-machines')}
            className="mt-4 md:mt-0 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
          >
            <span>View All Machinery</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => onNavigate('new-machines', undefined, { category: cat.name })}
              className="group bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col items-center text-center justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-500/40 flex items-center justify-center mb-3 transition">
                {getCategoryIcon(cat.icon)}
              </div>
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition leading-tight line-clamp-2">
                {cat.name}
              </h3>
              <div className="mt-2 text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 group-hover:border-amber-500/30">
                {cat.count} Available
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED NEW MACHINES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Direct from OEMs & Authorized Dealers
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Featured New Machines
            </h2>
          </div>
          <button
            onClick={() => onNavigate('new-machines')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
          >
            <span>Browse All New</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredNew.map((m) => (
            <MachineCard key={m.id} machine={m} onSelect={(id) => onNavigate('machine-detail', id)} />
          ))}
        </div>
      </section>

      {/* 4. FEATURED SECOND-HAND MACHINES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              Inspected Pre-Owned Equipment
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Featured Second-Hand Machines
            </h2>
          </div>
          <button
            onClick={() => onNavigate('used-machines')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
          >
            <span>Browse All Used</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredUsed.map((m) => (
            <MachineCard key={m.id} machine={m} onSelect={(id) => onNavigate('machine-detail', id)} />
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS (4-Step Section) */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-2">
              Transparent Commerce
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              How IVPS Mechatronics Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              A structured 4-step workflow ensuring machine integrity, privacy protection, and direct verified dealer connections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="font-bold text-white text-base">Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Find the exact machine model, capacity, and year across nationwide OEM and dealer inventories.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="font-bold text-white text-base">Compare</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare multi-axis travels, power ratings, working hours, conditions, and asking prices side-by-side.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="font-bold text-white text-base">Unlock Contact</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authorize the verified buyer contact fee to safeguard privacy and deter broker spam.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black flex items-center justify-center text-sm">
                04
              </div>
              <h3 className="font-bold text-white text-base">Connect Directly</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive direct cell phone, WhatsApp, and plant address for inspections, negotiations, and closing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST FEATURES & WHY US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-widest">
              Industrial Grade Security & Trust
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Engineered Exclusively for Heavy Machinery Commerce
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlike generic e-commerce platforms, IVPS Mechatronics is tailored for the high capital expenditure, complex technical specifications, and verification demands of modern manufacturing facilities.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Verified Industrial Brokers</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Every broker undergoes email OTP verification and corporate profile validation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Encrypted Broker Contact Protection</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Direct phone numbers and WhatsApp lines are protected against scraping until authorized unlock.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5">
                  <Cog className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Standardized Technical Specifications</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Dynamic engineering parameters: Spindle speeds, hydraulic tonnages, travel axes, and motor voltages.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
              Recently Listed Heavy Machinery
            </h3>
            <div className="space-y-4">
              {recentMachines.slice(0, 3).map((rm) => (
                <div
                  key={rm.id}
                  onClick={() => onNavigate('machine-detail', rm.id)}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition group"
                >
                  <img
                    src={rm.primary_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80'}
                    alt={rm.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition truncate">
                      {rm.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {rm.year} • {rm.category}
                    </div>
                    <div className="text-xs font-black text-amber-400 mt-1">
                      ₹{rm.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM BROKER CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              For Certified Machinery Brokers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Ready to Monetize or Broker Industrial Machinery?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              List equipment on IVPS Mechatronics today. Connect directly with enterprise procurement managers, tier-1 machine shops, and fabrication plants looking for immediate delivery.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('sell')}
                className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/30 transition transform active:scale-95"
              >
                List a Machine Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
