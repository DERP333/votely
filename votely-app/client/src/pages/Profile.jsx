import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Vote,
  CheckCircle2,
  Calendar,
  Save,
  ArrowRight,
  Shield,
  Activity,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const { user, updateUser, showToast } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    gender: user?.gender || '',
    voterId: user?.voterId || ''
  });

  const [stats, setStats] = useState({
    pollsCreatedCount: 0,
    pollsVotedCount: 0,
    createdPolls: [],
    votedPolls: []
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'voted'

  useEffect(() => {
    if (user?.email) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        gender: user.gender || '',
        voterId: user.voterId || ''
      });

      // Fetch user profile and stats
      fetch(`/api/users/profile/${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.stats) {
            setStats(data.stats);
          }
        })
        .catch((err) => console.error('Error loading profile stats:', err));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user?.email) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/users/profile/${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          gender: formData.gender,
          voterId: formData.voterId
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      updateUser(data.user);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Top Header */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Feature D: Voter Identity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Profile & Polling Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your registered voter profile and review your personal election footprint.
          </p>
        </div>

        {/* User Card + KPI Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main User Identity Badge */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex items-center space-x-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-600/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{user?.name || 'Voter'}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="inline-flex items-center space-x-1 mt-2 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Shield className="w-3 h-3" />
                <span>Verified Voter</span>
              </div>
            </div>
          </div>

          {/* Activity Stat 1: Polls Created */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Polls Created
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Vote className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {stats.pollsCreatedCount}
              </div>
              <p className="text-xs text-slate-400">Initiated by your account</p>
            </div>
          </div>

          {/* Activity Stat 2: Polls Voted in */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Polls Voted In
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {stats.pollsVotedCount}
              </div>
              <p className="text-xs text-slate-400">Official ballots cast</p>
            </div>
          </div>
        </div>

        {/* Profile Settings Form & Personal Activity Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Form (Left 5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Personal Registration Details</span>
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email Address (Identity Anchor)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Voter / Student / Govt ID
                </label>
                <input
                  type="text"
                  name="voterId"
                  value={formData.voterId}
                  onChange={handleChange}
                  placeholder="e.g. VT-2024-8891"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>

          {/* Activity Breakdown (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Personal Voting Activity</span>
              </h3>

              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('created')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'created'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Polls Created ({stats.createdPolls.length})
                </button>
                <button
                  onClick={() => setActiveTab('voted')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'voted'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Polls Voted ({stats.votedPolls.length})
                </button>
              </div>
            </div>

            {activeTab === 'created' ? (
              <div className="space-y-3">
                {stats.createdPolls.map((poll) => (
                  <div
                    key={poll.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono font-bold text-indigo-300">
                          {poll.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            poll.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {poll.status}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200 text-sm">{poll.question}</p>
                      <p className="text-slate-500 mt-1">
                        {poll.totalVotes} total votes cast • Created {new Date(poll.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <Link
                      to={`/history?selected=${poll.id}`}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 transition"
                      title="View Analytics"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))}

                {stats.createdPolls.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    You haven’t created any polls yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {stats.votedPolls.map((poll) => (
                  <div
                    key={poll.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono font-bold text-indigo-300">
                          {poll.code}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Voted on {new Date(poll.votedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200 text-sm mb-1">{poll.question}</p>
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Your Vote: {poll.selectedOptionText}</span>
                      </div>
                    </div>

                    <Link
                      to={`/history?selected=${poll.id}`}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 transition"
                      title="View Live Results"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))}

                {stats.votedPolls.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    You haven’t voted in any polls yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

