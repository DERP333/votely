import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Vote, User, LogIn, LayoutDashboard, PlusCircle, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Votely
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-indigo-400 font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Live Polling
            </span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            to="/"
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            Home
          </Link>
          <Link
            to="/participate"
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center space-x-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Active Polls</span>
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center space-x-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/create-poll"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Create Poll</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Action / Profile */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-1.5 rounded-full transition shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 max-w-[120px] truncate">
                  {user.name}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/onboarding"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

