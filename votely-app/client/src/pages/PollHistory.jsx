import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History,
  Filter,
  BarChart3,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Lock,
  Users,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import VoteChart from '../components/VoteChart';

const PollHistory = () => {
  const { user, socket, showToast } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedParam = searchParams.get('selected');

  const [polls, setPolls] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'active', 'expired', 'created'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchPolls = async () => {
    try {
      const emailQuery = user?.email ? `&creatorEmail=${encodeURIComponent(user.email)}` : '';
      const res = await fetch(`/api/polls`);
      const data = await res.json();
      if (data.success) {
        setPolls(data.polls);

        if (selectedParam) {
          fetchPollDetails(selectedParam);
        } else if (data.polls.length > 0 && !selectedPoll) {
          fetchPollDetails(data.polls[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPollDetails = async (idOrCode) => {
    try {
      const emailQuery = user?.email ? `?voterEmail=${encodeURIComponent(user.email)}` : '';
      const res = await fetch(`/api/polls/${idOrCode}${emailQuery}`);
      const data = await res.json();
      if (data.success) {
        setSelectedPoll(data.poll);
      }
    } catch (err) {
      console.error('Failed to load poll details:', err);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [user, selectedParam]);

  // Real-time update if current selected poll receives a vote
  useEffect(() => {
    if (!socket || !selectedPoll) return;

    const handlePollUpdated = (update) => {
      if (update.pollId === selectedPoll.id || update.code === selectedPoll.code) {
        fetchPollDetails(selectedPoll.id);
      }
    };

    socket.on('poll_updated', handlePollUpdated);
    return () => {
      socket.off('poll_updated', handlePollUpdated);
    };
  }, [socket, selectedPoll?.id]);

  // Filter logic
  const filteredPolls = polls.filter((p) => {
    // Tab filter
    if (filterType === 'active' && p.status !== 'Active') return false;
    if (filterType === 'expired' && p.status !== 'Expired') return false;
    if (filterType === 'created') {
      if (!user?.email || p.creatorEmail?.toLowerCase() !== user.email.toLowerCase()) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.question.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast(`Code ${code} copied!`, 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Top Header */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Feature C: Analytics & Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Polling Analytics & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dive into real-time vote distributions, review voter feedback commentary, and inspect past election records.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          {/* Tabs: All, Active, Expired, Created by Me */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Polls' },
              { id: 'active', label: 'Active' },
              { id: 'expired', label: 'Expired' },
              { id: 'created', label: 'Created by Me' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterType === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Split View: Left List / Right Details & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Polls List */}
          <div className="lg:col-span-5 space-y-3 max-h-[800px] overflow-y-auto pr-1">
            {filteredPolls.map((poll) => {
              const isSelected = selectedPoll?.id === poll.id;
              const isExpired = poll.status === 'Expired';
              return (
                <div
                  key={poll.id}
                  onClick={() => fetchPollDetails(poll.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/80 shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isExpired
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {poll.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {poll.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">
                    {poll.question}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{poll.totalVotes || 0} votes</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>{poll.feedbackCount || 0} feedback</span>
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredPolls.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/30 rounded-2xl border border-slate-800">
                No polls match the current filter.
              </div>
            )}
          </div>

          {/* Right Column: Selected Poll Analytics & Feedback */}
          <div className="lg:col-span-7">
            {selectedPoll ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
                {/* Header Information */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedPoll.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {selectedPoll.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Created {new Date(selectedPoll.createdAt).toLocaleDateString()} by{' '}
                        <strong className="text-slate-200">{selectedPoll.creatorName}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(selectedPoll.code)}
                      className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-mono font-bold text-indigo-300 transition"
                    >
                      <Lock className="w-3 h-3 text-indigo-400" />
                      <span>{selectedPoll.code}</span>
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {selectedPoll.question}
                  </h2>
                  {selectedPoll.description && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      {selectedPoll.description}
                    </p>
                  )}
                </div>

                {/* Vote Distribution Chart Component */}
                <VoteChart
                  options={selectedPoll.options}
                  totalVotes={selectedPoll.totalVotes}
                />

                {/* Feedback Comments Section */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>Voter Feedback Commentary</span>
                    </h3>
                    <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
                      {(selectedPoll.feedback || []).length} submissions
                    </span>
                  </div>

                  {selectedPoll.feedback && selectedPoll.feedback.length > 0 ? (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                      {selectedPoll.feedback.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-indigo-300">
                              {item.voterName || 'Anonymous Voter'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed italic">
                            "{item.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No feedback submitted with votes yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-sm">
                Select a poll from the list to inspect vote distribution and voter comments.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PollHistory;

