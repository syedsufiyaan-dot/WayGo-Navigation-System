import React from 'react';
import { Bus, Train, Zap, Car, ShieldAlert, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">WayGo</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-600/30 text-blue-400 font-semibold border border-blue-500/20">
                Chennai Edition
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Your Friendly Path Partner. Comparing routes across Bus (MTC), Chennai Suburban EMU, Chennai Metro (CMRL), and Auto-rickshaw to help you save travel time, minimize commuting costs, and travel smarter.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <span className="flex items-center gap-1 text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <Bus className="w-3.5 h-3.5 text-blue-400" /> Bus
              </span>
              <span className="flex items-center gap-1 text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <Train className="w-3.5 h-3.5 text-purple-400" /> Train
              </span>
              <span className="flex items-center gap-1 text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Metro
              </span>
              <span className="flex items-center gap-1 text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <Car className="w-3.5 h-3.5 text-amber-400" /> Auto
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">Plan Route</Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-blue-400 transition">Saved Routes</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-blue-400 transition">Search History</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition">About Algorithms & Graph</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Disclaimer
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              Transit routes, frequency, fares, and road travel times are computed using Dijkstra, A*, and verified academic Chennai transit schedules. Not affiliated with CMRL or MTC.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 WayGo – “Your Friendly Path Partner”. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Chennai Commuters with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
