import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Navigation,
  Bookmark,
  History,
  Info,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Plan Route', path: '/', icon: Navigation },
    { name: 'Saved Routes', path: '/saved', icon: Bookmark },
    { name: 'History', path: '/history', icon: History },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-800/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-navy-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  WayGo
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Chennai
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide hidden sm:block">
                Compare routes. Save time. Travel smart.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-navy-700/50 p-1.5 rounded-xl border border-navy-600/40">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-600/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & User */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-navy-700/60 hover:bg-navy-600 border border-navy-600/50 text-slate-300 hover:text-white transition"
              aria-label="Toggle dark/light theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-300" />}
            </button>

            {/* User Pill */}
            {user && (
              <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-navy-700/70 border border-navy-600/50 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-slate-200 truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email || user.phoneNumber}
                  </span>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-navy-700 text-slate-300 hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-300" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-navy-700 text-slate-300 hover:text-white"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-navy-700 bg-navy-800 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-4">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-navy-700/60 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email || user.phoneNumber}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-navy-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Logout from WayGo
          </button>
        </div>
      )}
    </header>
  );
};
