import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, X } from 'lucide-react';
import { TransitLocation } from '../../types/index.js';

interface ComboboxProps {
  label: string;
  placeholder: string;
  locations: TransitLocation[];
  value: string;
  onChange: (value: string) => void;
  iconColor?: string;
  error?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  label,
  placeholder,
  locations,
  value,
  onChange,
  iconColor = 'text-blue-500',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const filteredLocations = query === ''
    ? locations
    : locations.filter((loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.areaType.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // If user left invalid text, snap back to selected value
        if (value) {
          setQuery(value);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleSelect = (locName: string) => {
    onChange(locName);
    setQuery(locName);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredLocations.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredLocations.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredLocations.length) {
        handleSelect(filteredLocations[highlightedIndex].name);
      } else if (filteredLocations.length > 0) {
        handleSelect(filteredLocations[0].name);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </label>
      <div
        className={`relative flex items-center bg-white dark:bg-navy-800 border rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${
          error
            ? 'border-rose-400 dark:border-rose-700 bg-rose-50/20'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600'
        }`}
      >
        <div className={`pl-3.5 pr-1 ${iconColor}`}>
          <MapPin className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className="w-full py-3 px-2 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="pr-3 pl-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          aria-label="Toggle location dropdown"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 animate-in fade-in-50">
          {filteredLocations.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 text-center">
              No matching Chennai locations found
            </div>
          ) : (
            filteredLocations.map((loc, idx) => {
              const isSelected = value.toLowerCase() === loc.name.toLowerCase();
              const isHighlighted = idx === highlightedIndex;
              return (
                <div
                  key={loc.id}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(loc.name)}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                    isHighlighted
                      ? 'bg-blue-50 dark:bg-navy-700 text-blue-600 dark:text-blue-400'
                      : isSelected
                      ? 'bg-slate-50 dark:bg-navy-700/50 text-slate-900 dark:text-slate-100 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700/50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{loc.name}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{loc.areaType}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
