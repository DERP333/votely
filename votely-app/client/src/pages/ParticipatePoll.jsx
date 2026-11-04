import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Vote,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Search,
  Lock,
  ArrowRight,
  Send,
  AlertCircle,
  BarChart3,
  Sparkles,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import VoteChart from '../components/VoteChart';
import PollCard from '../components/PollCard';

const ParticipatePoll = () => {
  const { user, socket, showToast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const codeParam = searchParams.get('code') || '';

  const [enteredCode, setEnteredCode] = useState(codeParam);
  const [activePolls, setActivePolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [voterEmailInput, setVoterEmailInput] = useState(user?.email || '');
  const [voterNameInput, setVoterNameInput] = useState(user?.name || '');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all active polls for the list
  const fetchActivePolls = async () => {
    try {
      const voterQuery = user?.email ? `&voterEmail=${encodeURIComponent(user.email)}` : '';
      const res = await fetch(`/api/polls?status=Active${voterQuery}`);
      const data = await res.json();
      if (data.success) {
        setActivePolls(data.polls);
      }
    } catch (err) {
      console.error('Error fetching active polls:', err);
    }
  };

  // Fetch single poll by code or ID
  const fetchSinglePoll = async (identifier) => {
    if (!identifier) return;
    setLoading(true);
    try {
      const email = user?.email || voterEmailInput;
      const emailQuery = email ? `?voterEmail=${encodeURIComponent(email)}` : '';
      const res = await fetch(`/api/polls/${identifier.trim()}${emailQuery}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Poll not found.');
      }
      setSelectedPoll(data.poll);
      if (data.poll.userVotedOptionId) {
        setSelectedOptionId(data.poll.userVotedOptionId);
      }
    } catch (err) {
      showToast(err.message, 'error');
      setSelectedPoll(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePolls();
  }, [user]);

  // Load poll if query param has ?code=...
  useEffect(() => {
    if (codeParam) {
      setEnteredCode(codeParam);
      fetchSinglePoll(codeParam);
    }
  }, [codeParam, user]);

  // Socket room joining and live voting updates
  useEffect(() => {
    if (!socket || !selectedPoll) return;

    socket.emit('join_poll', selectedPoll.id);

    const handlePollUpdated = (update) => {
      if (update.pollId === selectedPoll.id || update.code === selectedPoll.code) {
        setSelectedPoll((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            totalVotes: update.totalVotes,
            options: update.options,
            feedback: update.recentFeedback
              ? [update.recentFeedback, ...(prev.feedback || [])]
              : prev.feedback
          };
        });
      }
    };

    socket.on('poll_updated', handlePollUpdated);

    return () => {
      socket.emit('leave_poll', selectedPoll.id);
      socket.off('poll_updated', handlePollUpdated);
    };
  }, [socket, selectedPoll?.id]);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!enteredCode.trim()) {
      showToast('Please enter a secret passcode.', 'error');
      return;
    }
    const clean = enteredCode.trim().toUpperCase();
    setSearchParams({ code: clean });
    fetchSinglePoll(clean);
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionId) {
      showToast('Please select one of the ballot options.', 'error');
      return;
    }

    const email = user?.email || voterEmailInput;
    if (!email || !email.trim()) {
      showToast('Please enter your email to verify your single ballot.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        pollId: selectedPoll.id,
        code: selectedPoll.code,
        selectedOptionId,
        userEmail: email.trim().toLowerCase(),
        userName: user?.name || voterNameInput || 'Voter',
        userId: user?.id,
        feedback: feedbackText.trim()
      };

      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Vote submission failed.');
      }

      setSelectedPoll(data.poll);
      showToast('Ballot verified and recorded successfully!', 'success');

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}

      // Refresh polls list in background
      fetchActivePolls();
    } catch (err) {
      showToast(err.message || 'Could not record vote.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPolls = activePolls.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.question.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Top Header */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Vote className="w-3.5 h-3.5" />
            <span>Feature B: Ballot Casting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Participate in Polling
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access restricted polls using unique secret passcodes or select from active community questions.
          </p>
        </div>

        {/* Passcode Entrance Bar */}
        <div className="mb-8 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
          <form onSubmit={handleCodeSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <KeyRound className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter 6-character Secret Passcode (e.g. VOTE-89X2)"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 font-mono tracking-wider uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 shrink-0"
            >
              <span>{loading ? 'Verifying Passcode...' : 'Unlock Poll'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Selected Poll Modal / Dedicated Voting Interface */}
        {selectedPoll && (
          <div className="mb-12 bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* Top Passcode & Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Active Session</span>
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-indigo-300">
                  Code: {selectedPoll.code}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span><strong>{selectedPoll.totalVotes || 0}</strong> votes recorded</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>
                    Expires: {new Date(selectedPoll.expiresAt).toLocaleDateString()}
                  </span>
                </span>
              </div>
            </div>

            {/* Question & Instructions */}
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              {selectedPoll.question}
            </h2>
            {selectedPoll.description && (
              <p className="text-sm text-slate-300 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {selectedPoll.description}
              </p>
            )}

            {/* If user has already voted */}
            {selectedPoll.userVoted ? (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex items-center space-x-3 text-indigo-200 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-white">You have cast your vote in this poll!</strong>
                    <p className="text-xs text-indigo-300 mt-0.5">
                      Strict one-vote policy enforced. Live verified results and community feedback are displayed below.
                    </p>
                  </div>
                </div>

                {/* Live Real-time Chart Display */}
                <VoteChart
                  options={selectedPoll.options}
                  totalVotes={selectedPoll.totalVotes}
                />

                {/* Feedback Comments Display */}
                {selectedPoll.feedback && selectedPoll.feedback.length > 0 && (
                  <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>Voter Feedback & Comments ({selectedPoll.feedback.length})</span>
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {selectedPoll.feedback.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between text-slate-400 mb-1">
                            <span className="font-semibold text-slate-200">{item.voterName}</span>
                            <span className="text-[10px]">{new Date(item.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-300 italic">"{item.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Ballot Form */
              <form onSubmit={handleVoteSubmit} className="space-y-6">
                {/* Options Radio List */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Select Your Candidate / Option <span className="text-rose-400">*</span>
                  </label>
                  {selectedPoll.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedOptionId === opt.id
                          ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-600/10 text-white'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <input
                          type="radio"
                          name="pollOption"
                          value={opt.id}
                          checked={selectedOptionId === opt.id}
                          onChange={() => setSelectedOptionId(opt.id)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-900"
                        />
                        <span className="text-sm font-semibold">{opt.text}</span>
                      </div>
                      {selectedOptionId === opt.id && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      )}
                    </label>
                  ))}
                </div>

                {/* Optional Feedback */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Add your thoughts / feedback alongside your vote</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Optional</span>
                  </div>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Why did you choose this option? What would you like leadership to consider?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Email Verification if not logged in */}
                {!user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        value={voterNameInput}
                        onChange={(e) => setVoterNameInput(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Your Email (For 1-Vote Enforcement) *
                      </label>
                      <input
                        type="email"
                        required
                        value={voterEmailInput}
                        onChange={(e) => setVoterEmailInput(e.target.value)}
                        placeholder="voter@domain.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Vote CTA */}
                <button
                  type="submit"
                  disabled={submitting || !selectedOptionId}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Authenticating & Recording...' : 'Cast Official Ballot'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Active Polls Catalog Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Active Polls Directory</h3>
              <p className="text-xs text-slate-400">Select any active poll to view details and cast your vote.</p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search polls or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVoteClick={(p) => {
                  setSelectedPoll(null);
                  setSearchParams({ code: p.code });
                  fetchSinglePoll(p.code);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                onViewDetails={(p) => navigate(`/history?selected=${p.id}`)}
              />
            ))}
          </div>

          {filteredPolls.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No matching polls found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParticipatePoll;

