import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Users,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  BarChart3,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PollCard = ({ poll, onVoteClick, onViewDetails }) => {
  const { user, showToast } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(poll.code);
    setCopied(true);
    showToast(`Secret code ${poll.code} copied to clipboard!`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = poll.status === 'Expired' || (poll.expiresAt && new Date(poll.expiresAt).getTime() < Date.now());
  const hasUserVoted = poll.userHasVoted || false;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between group backdrop-blur-sm">
      <div>
        {/* Top Header Badge & Secret Code */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isExpired
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isExpired ? 'bg-slate-500' : 'bg-emerald-400 animate-pulse'
                }`}
              ></span>
              <span>{isExpired ? 'Expired' : 'Active'}</span>
            </span>

            {hasUserVoted && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                <span>Voted</span>
              </span>
            )}
          </div>

          {/* Secret Code Pill with Copy */}
          <button
            onClick={handleCopyCode}
            title="Click to copy secret passcode"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-mono font-bold text-indigo-300 transition"
          >
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>{poll.code}</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />
            )}
          </button>
        </div>

        {/* Question Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2 mb-2">
          {poll.question}
        </h3>

        {/* Description snippet */}
        {poll.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4">
            {poll.description}
          </p>
        )}

        {/* Options Overview Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{poll.optionsCount || (poll.options && poll.options.length) || 2} Options</span>
            <span className="flex items-center space-x-1 text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{poll.totalVotes || 0} votes cast</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(5, (poll.totalVotes || 0) * 8))}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1" title="Expires at">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{poll.expiresAt ? formatDate(poll.expiresAt) : 'No expiry'}</span>
          </span>
          {poll.feedbackCount > 0 && (
            <span className="flex items-center space-x-1 text-slate-400">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>{poll.feedbackCount}</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(poll)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="View Live Analytics & Comments"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          )}

          {onVoteClick ? (
            <button
              onClick={() => onVoteClick(poll)}
              disabled={isExpired}
              className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition flex items-center space-x-1 ${
                isExpired
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : hasUserVoted
                  ? 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              <span>{hasUserVoted ? 'Results' : 'Vote'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <Link
              to={`/participate?code=${poll.code}`}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center space-x-1 shadow-md shadow-indigo-600/20"
            >
              <span>Enter</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollCard;

