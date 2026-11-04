import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Clock,
  KeyRound,
  Check,
  Copy,
  Share2,
  Sparkles,
  ArrowRight,
  Vote,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const CreatePoll = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [durationPreset, setDurationPreset] = useState('48'); // 48 hours default
  const [customExpiry, setCustomExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdPoll, setCreatedPoll] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errors, setErrors] = useState({});

  // Dynamic add option
  const handleAddOption = () => {
    if (options.length >= 8) {
      showToast('Maximum of 8 options allowed per poll.', 'info');
      return;
    }
    setOptions((prev) => [...prev, '']);
  };

  // Dynamic remove option
  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      showToast('At least 2 options are required for a valid poll.', 'error');
      return;
    }
    setOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle option text change
  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const validate = () => {
    const errs = {};
    if (!question.trim()) errs.question = 'Poll question is required.';

    const validOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (validOptions.length < 2) {
      errs.options = 'Provide at least 2 non-empty voting options.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let expiresAt = null;
      if (durationPreset === 'custom' && customExpiry) {
        expiresAt = new Date(customExpiry).toISOString();
      }

      const payload = {
        question: question.trim(),
        description: description.trim(),
        options: options.map((o) => o.trim()).filter((o) => o.length > 0),
        durationHours: durationPreset !== 'custom' ? durationPreset : null,
        expiresAt,
        creatorEmail: user?.email || 'anonymous@votely.io',
        creatorName: user?.name || 'Voter Organizer'
      };

      const res = await fetch('/api/polls/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create poll.');
      }

      setCreatedPoll(data.poll);
      showToast('Poll created successfully with secret passcode!', 'success');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }
    } catch (err) {
      showToast(err.message || 'Error occurred while creating poll.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecretCode = () => {
    if (!createdPoll) return;
    navigator.clipboard.writeText(createdPoll.code);
    setCopiedCode(true);
    showToast(`Secret code ${createdPoll.code} copied!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyShareLink = () => {
    if (!createdPoll) return;
    const shareUrl = `${window.location.origin}/participate?code=${createdPoll.code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showToast('Direct voting link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full overflow-y-auto">
        {createdPoll ? (
          /* Success Screen with Secret Code & Share Options */
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Poll Successfully Published!
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              Your poll is now live and accepting verified ballots. Share the generated passcode with eligible voters.
            </p>

            {/* Generated Secret Code Display */}
            <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-6 mb-8 max-w-md mx-auto relative group">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 block mb-2">
                Unique Secret Passcode
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white mb-4">
                {createdPoll.code}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCopySecretCode}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Code Copied!' : 'Copy Secret Code'}</span>
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
                </button>
              </div>
            </div>

            {/* Poll Summary Preview */}
            <div className="text-left bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-8 text-xs text-slate-300 space-y-2">
              <p>
                <strong className="text-slate-100">Question:</strong> {createdPoll.question}
              </p>
              <p>
                <strong className="text-slate-100">Options:</strong>{' '}
                {createdPoll.options.map((o) => o.text).join(' • ')}
              </p>
              <p>
                <strong className="text-slate-100">Expires:</strong>{' '}
                {new Date(createdPoll.expiresAt).toLocaleString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={`/participate?code=${createdPoll.code}`}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2"
              >
                <span>View / Vote on this Poll</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => {
                  setCreatedPoll(null);
                  setQuestion('');
                  setDescription('');
                  setOptions(['', '']);
                }}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-6 py-3 rounded-xl transition"
              >
                Create Another Poll
              </button>
            </div>
          </div>
        ) : (
          /* Form for Creating Poll */
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-9 shadow-xl backdrop-blur-md">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Vote className="w-3.5 h-3.5" />
                <span>Feature A: Authoring</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Create a New Secure Poll
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Configure your ballot question, add voting options, set an expiry date, and generate a 6-character access passcode.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Poll Question */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Poll Question / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Who should be elected as the Class Representative for 2024-2025?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
                {errors.question && (
                  <p className="text-rose-400 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.question}</span>
                  </p>
                )}
              </div>

              {/* Description / Instructions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Description / Instructions
                  </label>
                  <span className="text-[11px] text-slate-500">Optional background context</span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide guidance or manifesto links for voters before casting their decision..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Dynamic Options List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Voting Options <span className="text-rose-400">*</span> (Min 2 options)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Option</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1} title (e.g. Elena Rostova)`}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2.5 rounded-xl bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 transition shrink-0"
                          title="Remove option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.options && (
                  <p className="text-rose-400 text-xs mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.options}</span>
                  </p>
                )}
              </div>

              {/* Poll Duration / Expiry */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Poll Duration / Expiry Date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {[
                    { label: '24 Hours', value: '24' },
                    { label: '48 Hours', value: '48' },
                    { label: '7 Days', value: '168' },
                    { label: 'Custom', value: 'custom' }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setDurationPreset(preset.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                        durationPreset === preset.value
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {durationPreset === 'custom' && (
                  <div className="relative mt-2">
                    <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="datetime-local"
                      value={customExpiry}
                      onChange={(e) => setCustomExpiry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                )}
              </div>

              {/* Security Feature Notice */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-3 text-xs text-slate-400">
                <KeyRound className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  Upon submission, Votely generates a unique 6-character code (e.g. <span className="font-mono text-indigo-300">VOTE-89X2</span>) allowing only authorized participants with the passcode or link to cast ballots.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Generating Code & Creating Poll...' : 'Create Poll & Generate Passcode'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatePoll;

