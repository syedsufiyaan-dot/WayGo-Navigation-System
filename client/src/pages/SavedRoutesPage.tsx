import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Trash2,
  Calendar,
  Zap,
  Bus,
  Train,
  Car,
  Navigation,
  PlusCircle,
} from 'lucide-react';
import { Modal } from '../components/UI/Modal.js';
import { useToast } from '../components/UI/Toast.js';
import { FavoriteRoute } from '../types/index.js';

export const SavedRoutesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/user/favorites', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setFavorites(json.data);
        }
      }
    } catch {
      showToast('Failed to load saved routes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleDeleteFavorite = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/user/favorites/${deleteTargetId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== deleteTargetId));
        showToast('Saved route removed.', 'success');
      } else {
        showToast('Failed to remove saved route.', 'error');
      }
    } catch {
      showToast('Error removing route.', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleRunSearch = (sourceName: string, destName: string) => {
    navigate(`/?source=${encodeURIComponent(sourceName)}&destination=${encodeURIComponent(destName)}`);
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'METRO':
        return <Zap className="w-4 h-4 text-emerald-500" />;
      case 'TRAIN':
        return <Train className="w-4 h-4 text-purple-500" />;
      case 'BUS':
        return <Bus className="w-4 h-4 text-blue-500" />;
      case 'AUTO':
        return <Car className="w-4 h-4 text-amber-500" />;
      default:
        return <Navigation className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Saved Routes</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quickly re-run your frequent and favourite Chennai commutes
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Route</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-slate-100 dark:bg-navy-800 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && favorites.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-navy-800 rounded-3xl border border-slate-200 dark:border-navy-700 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Saved Routes Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              When searching Chennai routes, click the bookmark icon to save your regular daily travel lines for rapid 1-click comparison.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition"
          >
            Explore Routes Now
          </button>
        </div>
      )}

      {/* List of Saved Routes */}
      {!loading && favorites.length > 0 && (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-slate-200 dark:border-navy-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-navy-700 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                    {getModeIcon(fav.preferredMode)}
                    <span>{fav.preferredMode}</span>
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Saved {new Date(fav.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-slate-100">
                  <span>{fav.sourceLocation.name}</span>
                  <span className="text-blue-500">➔</span>
                  <span>{fav.destinationLocation.name}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() =>
                    handleRunSearch(fav.sourceLocation.name, fav.destinationLocation.name)
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTargetId(fav.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-navy-700 hover:border-rose-300 transition"
                  title="Remove from saved routes"
                  aria-label="Delete saved route"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Remove Saved Route"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to remove this route from your saved favorites?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteTargetId(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteFavorite}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
            >
              Remove Route
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
