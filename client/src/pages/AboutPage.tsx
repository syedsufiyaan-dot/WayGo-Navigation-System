import React from 'react';
import {
  Compass,
  Cpu,
  ShieldCheck,
  Zap,
  Users,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-tr from-navy-900 via-navy-800 to-indigo-950 rounded-3xl p-8 sm:p-10 border border-navy-700 text-white shadow-xl relative overflow-hidden">
        <div className="transit-glow-line w-64 h-64 bg-blue-500 top-0 right-0 rounded-full" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chennai Multi-Modal Transportation Project</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            WayGo – Your Friendly Path Partner
          </h1>

          <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
            “Compare routes. Save time. Travel smart.” WayGo is an academic multi-modal transit comparison platform built specifically for the diverse urban transit network of Chennai, India.
          </p>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition"
            >
              <span>Try WayGo Route Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Problem Statement & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 border border-slate-200 dark:border-navy-700 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Problem Statement</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Chennai's rapid urban expansion features disconnected transit systems across MTC buses, Chennai Suburban trains, CMRL Metro lines, and auto-rickshaws. Commuters often lack unified tools to quickly evaluate which transport combination offers the optimal balance between speed, cost, and physical travel distance.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 border border-slate-200 dark:border-navy-700 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Main Objectives</span>
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Deliver instant multi-modal route comparisons across 4 Chennai transit modes.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Compute mathematically guaranteed fastest, cheapest, and shortest paths.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Provide transparent, honest fare and time estimations without fake live feeds.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Target User Personas */}
      <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-navy-700 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Supported User Personas</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-700 space-y-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Daily Commuters
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Need the fastest suburban train or metro link to avoid rush-hour traffic jams along GST Road and Mount Road.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-700 space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Students
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Seek the most affordable MTC bus and train options to minimize daily commuting costs across colleges and hostels.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-700 space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Tourists
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Require clear station names, interchange pointers, and step-by-step navigation from Airport to Marina Beach and temples.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-700 space-y-2">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              Delivery Workers
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Require shortest physical distances and direct arterial road links between commercial hubs and residential neighborhoods.
            </p>
          </div>
        </div>
      </div>

      {/* Algorithms Explanation */}
      <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-navy-700 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Pathfinding Algorithms in WayGo</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            How WayGo calculates optimal journeys through Chennai's transportation graph
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dijkstra */}
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-navy-900/50 border border-blue-200 dark:border-blue-900/50 space-y-3">
            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400">
              1. Dijkstra's Algorithm (Minimum Time & Fare)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Dijkstra explores graph vertices from the source using non-negative edge weights. In WayGo:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span><strong>Fastest Route:</strong> Edge weight is duration in minutes + 3-minute interchange penalties.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span><strong>Cheapest Route:</strong> Edge weight is ticket fare in INR (₹).</span>
              </li>
            </ul>
          </div>

          {/* A* Search */}
          <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-navy-900/50 border border-purple-200 dark:border-purple-900/50 space-y-3">
            <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400">
              2. A* Search Algorithm (Shortest Distance)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              A* evaluates nodes using \(f(n) = g(n) + h(n)\), where \(g(n)\) is distance traveled from origin, and \(h(n)\) is the straight-line Haversine distance heuristic to the destination:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span><strong>Admissible Heuristic:</strong> The straight line is always \(\le\) actual road distance, ensuring mathematically optimal shortest routes.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Modules & Architecture */}
      <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-navy-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>System Architecture & Modules</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900/40 border border-slate-100 dark:border-navy-700">
            <strong className="text-slate-900 dark:text-slate-100 block mb-1">User Module</strong>
            <span className="text-slate-500 dark:text-slate-400">
              Secure registration, OTP verification via email & SMS, password lockout protection, and JWT HTTP-only cookie persistence.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900/40 border border-slate-100 dark:border-navy-700">
            <strong className="text-slate-900 dark:text-slate-100 block mb-1">Navigation & Graph Module</strong>
            <span className="text-slate-500 dark:text-slate-400">
              Dijkstra and A* routing engine connecting 24+ Chennai hubs across MTC Bus, EMU Train, Metro, and Auto.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900/40 border border-slate-100 dark:border-navy-700">
            <strong className="text-slate-900 dark:text-slate-100 block mb-1">Map & Visualisation Module</strong>
            <span className="text-slate-500 dark:text-slate-400">
              Interactive Leaflet OpenStreetMap canvas, mode-colored polylines, and Recharts multi-metric comparisons.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900/40 border border-slate-100 dark:border-navy-700">
            <strong className="text-slate-900 dark:text-slate-100 block mb-1">Recommendation Module</strong>
            <span className="text-slate-500 dark:text-slate-400">
              Highlights Fastest, Cheapest, and Shortest winners with ribbons and step-by-step Preview Navigation itineraries.
            </span>
          </div>
        </div>
      </div>

      {/* Limitations & Future Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 border border-slate-200 dark:border-navy-700 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Current Limitations & Academic Scope</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <li>• Internet connection required to render OpenStreetMap tiles.</li>
            <li>• Transit schedules and fares use verified academic benchmarks.</li>
            <li>• Real-time road congestion requires external live sensors.</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 border border-slate-200 dark:border-navy-700 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Future Scope & Roadmap</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <li>• Voice-assisted multi-lingual navigation in Tamil & English.</li>
            <li>• Offline vector map tile caching for zero-network situations.</li>
            <li>• Direct integration with live CMRL & MTC GPS telemetry APIs.</li>
            <li>• Dedicated native Android & iOS mobile applications.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
