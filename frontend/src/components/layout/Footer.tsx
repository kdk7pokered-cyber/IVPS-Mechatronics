import React from 'react';
import { Cog, ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm mt-20 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Cog className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-xl font-black tracking-wider text-white">IVPS MECHATRONICS</div>
                <div className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                  Industrial Heavy Machinery Marketplace
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              IVPS Mechatronics is India’s specialized B2B marketplace engineered for high-precision industrial machinery, heavy manufacturing equipment, CNC systems, and construction machinery. Connecting verified OEMs, certified dealers, brokers, and industrial manufacturing facilities nationwide.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Verified Machinery Network
              </span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="text-amber-400 font-medium">
                Encrypted Contact Protection
              </span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('new-machines')} className="hover:text-amber-400 transition">
                  New Industrial Machines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('used-machines')} className="hover:text-amber-400 transition">
                  Second-Hand Machines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('compare')} className="hover:text-amber-400 transition">
                  Compare Machinery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sell')} className="hover:text-amber-400 transition text-amber-400 font-medium">
                  List Your Machine
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Industrial Categories */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Key Categories
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="hover:text-slate-200 cursor-pointer">CNC Machining Centers</span></li>
              <li><span className="hover:text-slate-200 cursor-pointer">Heavy Duty Lathes</span></li>
              <li><span className="hover:text-slate-200 cursor-pointer">Hydraulic Presses</span></li>
              <li><span className="hover:text-slate-200 cursor-pointer">Earthmoving Excavators</span></li>
              <li><span className="hover:text-slate-200 cursor-pointer">Industrial Screw Compressors</span></li>
              <li><span className="hover:text-slate-200 cursor-pointer">Diesel Silent Generators</span></li>
            </ul>
          </div>

          {/* Col 4: Corporate Office & Support */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Corporate Desk
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>IVPS Mechatronics Towers, Industrial Zone, Bhosari, Pune, MH 411026</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 20 4589 7700 / +91 98200 11223</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>contact@ivpsmechatronics.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} IVPS Mechatronics Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Commercial Listing</span>
            <span className="hover:text-slate-300 cursor-pointer">Contact Access Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
