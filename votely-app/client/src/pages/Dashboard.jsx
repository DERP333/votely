import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Vote,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import PollCard from '../components/PollCard';

const Dashboard = () => {
  const { user, socket, showToast } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPolls: 0,
    totalVotesCast: 0,
    activePollsCount: 0,
    expiredPollsCount: 0,
    userStats: { myPollsCount: 0, myVotesCount: 0 }
  });

  const [activePolls, setActivePolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickCodeInput, setQuickCodeInput] = useState('');

  // Fetch KPI stats and active polls
  const loadDashboardData = async () => {
    try {
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      const statsRes = await fetch(`/api/polls/stats${emailQuery}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      const voterParam = user?.email ? `&voterEmail=${encodeURIComponent(user.email)}` : '';
      const pollsRes = await fetch(`/api/polls?status=Active${voterParam}`);
      const pollsData = await pollsRes.json();
      if (pollsData.success) {
        setActivePolls(pollsData.polls);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Real-time socket listener for live counter updates
  useEffect(() => {
    if (!socket) return;

    const handlePollUpdated = (update) => {
      // Increment total votes cast live
      setStats((prev) => ({
        ...prev,
        totalVotesCast: prev.totalVotesCast + 1
      }));

      // Update specific poll card live
      setActivePolls((prev) =>
        prev.map((p) => {
          if (p.id === update.pollId || p.code === update.code) {
            return {
              ...p,
              totalVotes: update.totalVotes,
              feedbackCount: update.feedbackCount
            };
          }
          return p;
        })
      );
    };

    const handlePollCreated = (newPoll) => {
      setStats((prev) => ({
        ...prev,
        totalPolls: prev.totalPolls + 1,
        activePollsCount: prev.activePollsCount + 1
      }));
      loadDashboardData();
    };

    socket.on('poll_updated', handlePollUpdated);
    socket.on('poll_created', handlePollCreated);

    return () => {
      socket.off('poll_updated', handlePollUpdated);
      socket.off('poll_created', handlePollCreated);
    };
  }, [socket]);

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (!quickCodeInput.trim()) {
      showToast('Please enter a secret passcode.', 'error');
      return;
    }
    navigate(`/participate?code=${quickCodeInput.trim().toUpperCase()}`);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Welcome Greeting & Quick Actions Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Intelligence Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Voter'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Monitor voting statistics, review community sentiment, and manage your polling campaigns.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/create-poll"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Poll</span>
            </Link>
          </div>
        </div>

        {/* Quick Join Secret Code Bar */}
        <div className="mb-8 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Join Restricted Poll with Passcode</h3>
              <p className="text-xs text-slate-400">Have a 6-character code like <code>VOTE-89X2</code>? Enter it below to cast your ballot.</p>
            </div>
          </div>

          <form onSubmit={handleQuickJoin} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. VOTE-89X2"
              value={quickCodeInput}
              onChange={(e) => setQuickCodeInput(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 uppercase font-mono tracking-wider focus:outline-none focus:border-indigo-500 w-full sm:w-44"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition shrink-0"
            >
              Enter
            </button>
          </form>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {/* Card 1: Total Polls Created */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Polls
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Vote className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {stats.totalPolls}
              </div>
              <p className="text-xs text-slate-400">
                <span className="text-indigo-400 font-semibold">{stats.userStats?.myPollsCount || 0}</span> created by you
              </p>
            </div>
          </div>

          {/* Card 2: Total Votes Cast */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Votes Cast
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white mb-1 flex items-center space-x-2">
                <span>{stats.totalVotesCast}</span>
                <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Across all active & past polls
              </p>
            </div>
          </div>

          {/* Card 3: Active Polls */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Polls
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {stats.activePollsCount}
              </div>
              <p className="text-xs text-slate-400">
                Currently open for participation
              </p>
            </div>
          </div>

          {/* Card 4: My Participation */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                My Ballots Cast
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {stats.userStats?.myVotesCount || 0}
              </div>
              <p className="text-xs text-slate-400">
                Authenticated votes registered
              </p>
            </div>
          </div>
        </div>

        {/* Active Polls Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Active Polls Ready for Voting
              </h2>
            </div>
            <Link
              to="/participate"
              className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-60 rounded-2xl bg-slate-900/70 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : activePolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onVoteClick={(p) => navigate(`/participate?code=${p.code}`)}
                  onViewDetails={(p) => navigate(`/history?selected=${p.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <Vote className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300 mb-1">No active polls found</h3>
              <p className="text-xs text-slate-500 mb-4">Be the first to launch a community question!</p>
              <Link
                to="/create-poll"
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create a Poll</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

