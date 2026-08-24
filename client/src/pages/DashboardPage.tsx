import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Compass,
  Zap,
  IndianRupee,
  MapPin,
  Bus,
  Train,
  Car,
  Bookmark,
  Navigation as NavIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Map,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Combobox } from '../components/UI/Combobox.js';
import { RouteMap } from '../components/Map/RouteMap.js';
import { RouteComparisonChart } from '../components/Charts/RouteComparisonChart.js';
import { NavigationRunner } from '../components/Navigation/NavigationRunner.js';
import { useToast } from '../components/UI/Toast.js';
import {
  TransitLocation,
  RouteOption,
  RouteCalculationResponse,
} from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Locations state
  const [locations, setLocations] = useState<TransitLocation[]>([]);

  // Search input state
  const [source, setSource] = useState(searchParams.get('source') || 'Chennai Central');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Anna Nagar');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // User Geolocation state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Filter & Sort state
  const [selectedPreference, setSelectedPreference] = useState<'FASTEST' | 'CHEAPEST' | 'SHORTEST'>('FASTEST');
  const [selectedModeFilter, setSelectedModeFilter] = useState<'ALL' | 'BUS' | 'TRAIN' | 'METRO' | 'AUTO'>('ALL');

  // Search Results state
  const [calculationResult, setCalculationResult] = useState<RouteCalculationResponse | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // Saved Routes Ids
  const [savedRouteIds, setSavedRouteIds] = useState<Set<string>>(new Set());

  // Active Navigation Runner Modal
  const [activeNavRoute, setActiveNavRoute] = useState<RouteOption | null>(null);

  // Mobile Map Sheet Toggle
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  // 1. Fetch all locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/routes/locations');
        const json = await res.json();
        if (json.success && json.data) {
          setLocations(json.data);
        }
      } catch (err) {
        showToast('Failed to load Chennai transit locations.', 'error');
      }
    };
    fetchLocations();
  }, [showToast]);

  // 2. Fetch user's existing saved favorites to reflect bookmark status
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch('/api/user/favorites', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const keys = new Set<string>(
              json.data.map((f: any) => `${f.sourceLocation?.name}-${f.destinationLocation?.name}`)
            );
            setSavedRouteIds(keys);
          }
        }
      } catch {
        // Fallback silently
      }
    };
    fetchFavorites();
  }, []);

  // 3. Auto-search initial default route or URL search params once locations load
  useEffect(() => {
    if (locations.length > 0 && !calculationResult && !isSearching) {
      executeRouteSearch(source, destination);
    }
  }, [locations]);

  // Execute Route Search
  const executeRouteSearch = async (src: string, dst: string) => {
    if (!src || !dst) {
      setSearchError('Please select both starting point and destination.');
      return;
    }
    if (src.toLowerCase().trim() === dst.toLowerCase().trim()) {
      setSearchError('Source and destination cannot be the same location.');
      return;
    }

    setSearchError(null);
    setIsSearching(true);

    try {
      const res = await fetch('/api/routes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          source: src,
          destination: dst,
          modeFilter: selectedModeFilter,
          preference: selectedPreference,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCalculationResult(json.data);
        if (json.data.routes.length > 0) {
          setSelectedRoute(json.data.routes[0]);
          setExpandedRouteId(json.data.routes[0].id);
        }
        // Update URL query parameters
        setSearchParams({ source: src, destination: dst });
      } else {
        setSearchError(json.message || 'No available routes found between these locations.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Network error while calculating routes.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeRouteSearch(source, destination);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    if (temp && destination) {
      executeRouteSearch(destination, temp);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);

        // Find closest Chennai location
        if (locations.length > 0) {
          let closest = locations[0];
          let minDistance = Infinity;

          for (const loc of locations) {
            const dist = Math.hypot(loc.latitude - lat, loc.longitude - lng);
            if (dist < minDistance) {
              minDistance = dist;
              closest = loc;
            }
          }

          setSource(closest.name);
          showToast(`Mapped your location to nearest hub: ${closest.name}`, 'info');
        }
        setDetectingLocation(false);
      },
      (_err) => {
        showToast('Unable to retrieve location. Defaulting to Central Chennai.', 'warning');
        setDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  const handleToggleSaveRoute = async (route: RouteOption) => {
    const key = `${route.source}-${route.destination}`;
    const isSaved = savedRouteIds.has(key);

    try {
      if (isSaved) {
        showToast('Route already in your Saved Routes.', 'info');
      } else {
        const res = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            sourceName: route.source,
            destName: route.destination,
            preferredMode: route.mode,
          }),
        });
        if (res.ok) {
          setSavedRouteIds((prev) => new Set(prev).add(key));
          showToast('Route saved to your Favorites!', 'success');
        }
      }
    } catch {
      showToast('Failed to save route. Please try again.', 'error');
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'METRO':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Metro
          </span>
        );
      case 'TRAIN':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 px-2.5 py-0.5 rounded-lg">
            <Train className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Suburban Train
          </span>
        );
      case 'BUS':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 px-2.5 py-0.5 rounded-lg">
            <Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> MTC Bus
          </span>
        );
      case 'AUTO':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 rounded-lg">
            <Car className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Auto-rickshaw
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-slate-100 dark:bg-navy-700 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg">
            <NavIcon className="w-3.5 h-3.5 text-blue-500" /> Multi-Modal
          </span>
        );
    }
  };

  // Filtered routes based on selected mode filter
  const displayedRoutes = calculationResult?.routes.filter((r) => {
    if (selectedModeFilter === 'ALL') return true;
    return r.mode === selectedModeFilter;
  }) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* 3 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-800 p-4 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-800">
            24+
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Chennai Areas</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hubs from Central to OMR</p>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 p-4 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-200 dark:border-emerald-800">
            4
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Transport Modes</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bus, Train, Metro & Auto</p>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 p-4 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Smart Comparison</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Dijkstra & A* Optimization</p>
          </div>
        </div>
      </div>

      {/* Main Search Formulation Card */}
      <div className="bg-white dark:bg-navy-800 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-navy-700 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Source Combobox */}
            <div className="flex-1 w-full">
              <Combobox
                label="Starting Point (Source)"
                placeholder="Search pickup hub (e.g. Chennai Central)"
                locations={locations}
                value={source}
                onChange={setSource}
                iconColor="text-emerald-500"
              />
            </div>

            {/* Swap Button */}
            <div className="pt-5 flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                className="p-3 rounded-xl bg-slate-100 dark:bg-navy-700 hover:bg-slate-200 dark:hover:bg-navy-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-600 transition shadow-sm hover:scale-105"
                title="Swap Source and Destination"
                aria-label="Swap starting point and destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Combobox */}
            <div className="flex-1 w-full">
              <Combobox
                label="Destination"
                placeholder="Search drop location (e.g. Anna Nagar)"
                locations={locations}
                value={destination}
                onChange={setDestination}
                iconColor="text-rose-500"
              />
            </div>
          </div>

          {/* Quick Actions and Search Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={detectingLocation}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Compass className={`w-4 h-4 ${detectingLocation ? 'animate-spin' : ''}`} />
              <span>{detectingLocation ? 'Detecting Location...' : 'Use Current Location'}</span>
            </button>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <span>Calculating Routes...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Routes</span>
                </>
              )}
            </button>
          </div>

          {/* Search Inline Error */}
          {searchError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </form>
      </div>

      {/* Route Results View */}
      {calculationResult && (
        <div className="space-y-6">
          {/* 3 Summary Winner Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Fastest Summary Card */}
            <div
              onClick={() => {
                setSelectedRoute(calculationResult.summary.fastest);
                setExpandedRouteId(calculationResult.summary.fastest.id);
              }}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all transform hover:-translate-y-0.5 shadow-sm ${
                selectedRoute?.id === calculationResult.summary.fastest.id
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-navy-800 border-blue-200 dark:border-blue-900/50 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2.5 py-1 rounded-lg">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Fastest Option
                </span>
                {getModeBadge(calculationResult.summary.fastest.mode)}
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {calculationResult.summary.fastest.totalTimeMins} mins
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {calculationResult.summary.fastest.routeName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                    ₹{calculationResult.summary.fastest.totalFareInr}
                  </p>
                  <p className="text-[10px] text-slate-400">per person</p>
                </div>
              </div>
            </div>

            {/* 2. Cheapest Summary Card */}
            <div
              onClick={() => {
                setSelectedRoute(calculationResult.summary.cheapest);
                setExpandedRouteId(calculationResult.summary.cheapest.id);
              }}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all transform hover:-translate-y-0.5 shadow-sm ${
                selectedRoute?.id === calculationResult.summary.cheapest.id
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-navy-800 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg">
                  <IndianRupee className="w-3.5 h-3.5" /> Cheapest Option
                </span>
                {getModeBadge(calculationResult.summary.cheapest.mode)}
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{calculationResult.summary.cheapest.totalFareInr}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {calculationResult.summary.cheapest.routeName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {calculationResult.summary.cheapest.totalTimeMins} mins
                  </p>
                  <p className="text-[10px] text-slate-400">travel time</p>
                </div>
              </div>
            </div>

            {/* 3. Shortest Summary Card */}
            <div
              onClick={() => {
                setSelectedRoute(calculationResult.summary.shortest);
                setExpandedRouteId(calculationResult.summary.shortest.id);
              }}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all transform hover:-translate-y-0.5 shadow-sm ${
                selectedRoute?.id === calculationResult.summary.shortest.id
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20'
                  : 'bg-white dark:bg-navy-800 border-rose-200 dark:border-rose-900/50 hover:border-rose-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5" /> Shortest Option
                </span>
                {getModeBadge(calculationResult.summary.shortest.mode)}
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {calculationResult.summary.shortest.totalDistanceKm} km
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {calculationResult.summary.shortest.routeName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {calculationResult.summary.shortest.totalTimeMins} mins
                  </p>
                  <p className="text-[10px] text-slate-400">travel time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Multi-modal Comparison Chart */}
          <RouteComparisonChart data={calculationResult.comparisonChart} />

          {/* Mode Filters & Preference Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-navy-800 p-3.5 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-sm">
            {/* Mode Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['ALL', 'BUS', 'TRAIN', 'METRO', 'AUTO'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedModeFilter(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedModeFilter === m
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-600'
                  }`}
                >
                  {m === 'ALL'
                    ? 'All Modes'
                    : m === 'BUS'
                    ? 'Bus'
                    : m === 'TRAIN'
                    ? 'Train'
                    : m === 'METRO'
                    ? 'Metro'
                    : 'Auto'}
                </button>
              ))}
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSelectedModeFilter('ALL');
                setSelectedPreference('FASTEST');
              }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Results Grid: Cards & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Detailed Route Cards (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Found {displayedRoutes.length} Route Options
                </h3>

                {/* Mobile Floating Map Toggle */}
                <button
                  type="button"
                  onClick={() => setMobileMapOpen(!mobileMapOpen)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md"
                >
                  <Map className="w-4 h-4" />
                  <span>{mobileMapOpen ? 'Hide Map' : 'View on Map'}</span>
                </button>
              </div>

              {/* Empty state when no routes match filter */}
              {displayedRoutes.length === 0 && (
                <div className="p-8 text-center bg-white dark:bg-navy-800 rounded-3xl border border-slate-200 dark:border-navy-700 space-y-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No routes found for the selected mode filter.
                  </p>
                  <button
                    onClick={() => setSelectedModeFilter('ALL')}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    View All Modes
                  </button>
                </div>
              )}

              {/* List of Detailed Route Cards */}
              {displayedRoutes.map((route) => {
                const isSelected = selectedRoute?.id === route.id;
                const isExpanded = expandedRouteId === route.id;
                const isSaved = savedRouteIds.has(`${route.source}-${route.destination}`);

                return (
                  <div
                    key={route.id}
                    className={`rounded-2xl border-2 transition-all bg-white dark:bg-navy-800 overflow-hidden shadow-sm ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/10'
                        : 'border-slate-200 dark:border-navy-700 hover:border-slate-300'
                    }`}
                  >
                    {/* Route Card Ribbon */}
                    {(route.isFastest || route.isCheapest || route.isShortest) && (
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-navy-900 border-b border-slate-100 dark:border-navy-700 text-[11px] font-bold">
                        {route.isFastest && (
                          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-current" /> FASTEST OPTION
                          </span>
                        )}
                        {route.isCheapest && (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" /> CHEAPEST OPTION
                          </span>
                        )}
                        {route.isShortest && (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> SHORTEST OPTION
                          </span>
                        )}
                      </div>
                    )}

                    {/* Main Card Header Info */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getModeBadge(route.mode)}
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {route.frequency}
                            </span>
                          </div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                            {route.routeName}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            From: {route.boardingLocation} ➔ To: {route.destinationStop}
                          </p>
                        </div>

                        {/* Price Display */}
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-black text-slate-900 dark:text-white">
                            ₹{route.totalFareInr}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                            Per person
                          </span>
                        </div>
                      </div>

                      {/* Travel Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-100 dark:border-navy-700/60 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Est. Travel Time
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {route.totalTimeMins} mins
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Distance
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {route.totalDistanceKm} km
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Est. Traffic
                          </span>
                          <span
                            className={`font-bold ${
                              route.trafficLevel === 'Heavy'
                                ? 'text-rose-500'
                                : route.trafficLevel === 'Moderate'
                                ? 'text-amber-500'
                                : 'text-emerald-500'
                            }`}
                          >
                            {route.trafficLevel}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Step-by-Step Directions */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-100 dark:border-navy-700 space-y-3 animate-in fade-in-50">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Step-by-step Itinerary
                          </h5>
                          <div className="space-y-2.5">
                            {route.steps.map((step) => (
                              <div
                                key={step.stepNumber}
                                className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300"
                              >
                                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-navy-700 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  {step.stepNumber}
                                </span>
                                <div className="flex-1">
                                  <p className="font-semibold">{step.instruction}</p>
                                  {step.distanceKm > 0 && (
                                    <p className="text-[11px] text-slate-400">
                                      ~{step.distanceKm} km · ~{step.durationMins} mins
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-navy-700">
                        {/* Toggle Route Details */}
                        <button
                          type="button"
                          onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                          <span>{isExpanded ? 'Hide Route Details' : 'View Route Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <div className="flex items-center gap-2">
                          {/* View on Map */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoute(route);
                              setMobileMapOpen(true);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>View on Map</span>
                          </button>

                          {/* Save Route */}
                          <button
                            type="button"
                            onClick={() => handleToggleSaveRoute(route)}
                            className={`p-2 rounded-xl text-xs border transition ${
                              isSaved
                                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-300'
                                : 'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-navy-600 hover:text-blue-600'
                            }`}
                            title={isSaved ? 'Route is saved' : 'Save Route to Favorites'}
                            aria-label="Save Route"
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                          </button>

                          {/* Start Preview Navigation */}
                          <button
                            type="button"
                            onClick={() => setActiveNavRoute(route)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
                          >
                            <NavIcon className="w-3.5 h-3.5" />
                            <span>Start Navigation</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Leaflet Map (5 cols on desktop, sticky) */}
            <div className={`lg:col-span-5 ${mobileMapOpen ? 'block' : 'hidden lg:block'} sticky top-20`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Live Route Journey Map
                  </h3>
                  {selectedRoute && (
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {selectedRoute.modeLabel}
                    </span>
                  )}
                </div>

                <RouteMap
                  sourceLocation={calculationResult.source}
                  destLocation={calculationResult.destination}
                  selectedRoute={selectedRoute}
                  allLocations={locations}
                  userLocation={userLocation}
                  className="h-[520px] w-full"
                />

                <p className="text-[11px] text-slate-400 text-center">
                  Transit path geometry is approximated using academic route coordinates & OpenStreetMap.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Preview Navigation Runner Modal */}
      {activeNavRoute && (
        <NavigationRunner
          route={activeNavRoute}
          onClose={() => setActiveNavRoute(null)}
        />
      )}
    </div>
  );
};
