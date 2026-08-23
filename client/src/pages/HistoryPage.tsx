import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Trash2,
  Clock,
  Zap,
  Bus,
  Train,
  Car,
  Navigation,
} from 'lucide-react';
import { Modal } from '../components/UI/Modal.js';
import { useToast } from '../components/UI/Toast.js';
import { RouteHistoryItem } from '../types/index.js';

export const HistoryPage: React.FC = () => {
  const [historyList, setHistoryList] = useState<RouteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/user/history', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setHistoryList(json.data);
        }
      }
    } catch {
      showToast('Failed to load search history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearAllHistory = async () => {
    try {
      const res = await fetch('/api/user/history', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setHistoryList([]);
        showToast('Search history cleared successfully.', 'success');
      } else {
        showToast('Failed to clear history.', 'error');
      }
    } catch {
      showToast('Error clearing search history.', 'error');
    } finally {
      setClearModalOpen(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/user/history/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setHistoryList((prev) => prev.filter((item) => item.id !== id));
        showToast('Search record removed.', 'info');
      }
    } catch {
      showToast('Failed to remove history record.', 'error');
    }
  };

  const handleRunSearch = (sourceName: string, destName: string) => {
    navigate(`/?source=${encodeURIComponent(sourceName)}&destination=${encodeURIComponent(destName)}`);
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'METRO':
        return <Zap className="w-3.5 h-3.5 text-emerald-500" />;
      case 'TRAIN':
        return <Train className="w-3.5 h-3.5 text-purple-500" />;
      case 'BUS':
        return <Bus className="w-3.5 h-3.5 text-blue-500" />;
      case 'AUTO':
        return <Car className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Search History</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Recent routes and multi-modal transit comparisons you looked up
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={() => setClearModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-semibold hover:bg-rose-100 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-navy-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && historyList.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-navy-800 rounded-3xl border border-slate-200 dark:border-navy-700 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Search History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your recent route queries across Chennai bus, train, metro, and auto will automatically appear here.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition"
          >
            Start Comparing Routes
          </button>
        </div>
      )}

      {/* History List */}
      {!loading && historyList.length > 0 && (
        <div className="space-y-2.5">
          {historyList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-navy-800 rounded-2xl p-4 border border-slate-200 dark:border-navy-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold bg-slate-100 dark:bg-navy-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    {getModeIcon(item.selectedMode)}
                    <span>{item.selectedMode}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.searchedAt).toLocaleString()}</span>
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{item.sourceLocation.name}</span>
                  <span className="text-blue-500 text-xs">➔</span>
                  <span>{item.destinationLocation.name}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleRunSearch(item.sourceLocation.name, item.destinationLocation.name)
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Re-run</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-navy-700 transition"
                  aria-label="Delete history item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear All Route History"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to completely clear your search history? This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setClearModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAllHistory}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
            >
              Yes, Clear All
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
