import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Vote,
  ShieldCheck,
  Zap,
  Lock,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  KeyRound,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PollCard from '../components/PollCard';

const LandingPage = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  const [quickCode, setQuickCode] = useState('');
  const [featuredPolls, setFeaturedPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/polls?status=Active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFeaturedPolls(data.polls.slice(0, 3));
        }
      })
      .catch((err) => console.error('Failed to load featured polls:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (!quickCode.trim()) {
      showToast('Please enter a valid secret code.', 'error');
      return;
    }
    const clean = quickCode.trim().toUpperCase();
    navigate(`/participate?code=${clean}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-slate-800/80 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Security Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Cryptographic Secret Codes & Strict One-Vote Enforcement</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Votely
          </h1>

          {/* Subtitle / Quote */}
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold bg-gradient-to-r from-indigo-200 via-white to-purple-200 bg-clip-text text-transparent max-w-3xl mx-auto mb-6 italic">
            "Your Voice Matters. The Power of Your Vote in Your Hands."
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create high-integrity polls with auto-generated passcodes, cast tamper-evident votes with real-time feedback, and watch live analytical counters update instantaneously.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to={user ? '/dashboard' : '/onboarding'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span>{user ? 'Go to Dashboard' : 'Get Started'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/participate"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base transition flex items-center justify-center space-x-2"
            >
              <Vote className="w-5 h-5 text-indigo-400" />
              <span>Explore Live Polls</span>
            </Link>
          </div>

          {/* Quick Secret Code Enter Card */}
          <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-2xl backdrop-blur-md">
            <form onSubmit={handleQuickJoin} className="flex items-center gap-2">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Secret Code (e.g. VOTE-89X2)"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 uppercase font-mono tracking-wider"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center space-x-1 shrink-0"
              >
                <span>Join</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Engineered for Integrity and Real-Time Speed
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Everything you need to gather authentic consensus from teams, universities, and communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secret Code Passkeys</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every poll generates a 6-character cryptographic passcode (e.g. <code>VOTE-89X2</code>) to control restricted participation with shareable links.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Strict 1-Vote Enforcement</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Prevents duplicate votes via validated digital voter verification and tamper-resistant state tracking.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Real-Time Charts</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Watch bar and pie charts react instantaneously to votes streamed through WebSocket connections without page reloads.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Live Polls Preview */}
      <section className="py-16 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Showcase</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Live Polls in Progress</h2>
            </div>
            <Link
              to="/participate"
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View All Polls</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : featuredPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              No active polls available at this moment. Create one now!
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              V
            </div>
            <span className="font-bold text-slate-300">Votely Platform</span>
          </div>
          <p>© {new Date().getFullYear()} Votely. "The Power of Your Vote in Your Hands." All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

