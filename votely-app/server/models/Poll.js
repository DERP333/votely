const { db } = require('../config/db');

class Poll {
  // Automatically check and update status if expired
  static checkExpiry(poll) {
    if (!poll) return null;
    if (poll.expiresAt && new Date(poll.expiresAt).getTime() < Date.now()) {
      poll.status = 'Expired';
    }
    return poll;
  }

  static async find(query = {}) {
    let list = (db.data.polls || []).map(p => this.checkExpiry({ ...p }));

    if (query.status) {
      list = list.filter(p => p.status.toLowerCase() === query.status.toLowerCase());
    }
    if (query.creatorEmail) {
      list = list.filter(p => p.creatorEmail.toLowerCase() === query.creatorEmail.toLowerCase());
    }
    if (query.voterEmail) {
      list = list.filter(p => (p.voters || []).some(v => v.email.toLowerCase() === query.voterEmail.toLowerCase()));
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(p =>
        p.question.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.code.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findById(id) {
    const poll = (db.data.polls || []).find(p => p.id === id);
    return poll ? this.checkExpiry({ ...poll }) : null;
  }

  static async findOne(query = {}) {
    const list = await this.find(query);
    return list[0] || null;
  }

  static async findByCode(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    const poll = (db.data.polls || []).find(p => p.code.toUpperCase() === cleanCode);
    return poll ? this.checkExpiry({ ...poll }) : null;
  }

  static async create(pollData) {
    const newPoll = {
      id: `poll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: pollData.code.toUpperCase(),
      question: pollData.question,
      description: pollData.description || '',
      creatorEmail: pollData.creatorEmail.toLowerCase(),
      creatorName: pollData.creatorName || 'Anonymous Organizer',
      options: pollData.options.map((opt, idx) => ({
        id: `opt-${idx + 1}-${Date.now().toString().slice(-4)}`,
        text: typeof opt === 'string' ? opt : opt.text,
        votes: 0
      })),
      voters: [],
      feedback: [],
      status: 'Active',
      expiresAt: pollData.expiresAt || new Date(Date.now() + 86400000 * 3).toISOString(),
      createdAt: new Date().toISOString()
    };

    db.data.polls.unshift(newPoll);
    db.save();
    return newPoll;
  }

  static async addVote(pollId, { userEmail, userName, userId, optionId, feedbackComment }) {
    const index = (db.data.polls || []).findIndex(p => p.id === pollId);
    if (index === -1) {
      throw new Error('Poll not found.');
    }

    const poll = db.data.polls[index];
    this.checkExpiry(poll);

    if (poll.status === 'Expired') {
      throw new Error('This poll has expired and is no longer accepting votes.');
    }

    // Strict One-Vote-Per-User enforcement: check if email or userId has already voted
    const alreadyVoted = (poll.voters || []).some(v =>
      (v.email && v.email.toLowerCase() === userEmail.toLowerCase()) ||
      (userId && v.userId === userId)
    );

    if (alreadyVoted) {
      throw new Error('You have already cast your vote in this poll. Duplicate voting is prevented.');
    }

    // Find option
    const option = poll.options.find(o => o.id === optionId);
    if (!option) {
      throw new Error('Selected option does not exist in this poll.');
    }

    // Increment votes
    option.votes = (option.votes || 0) + 1;

    // Record voter
    poll.voters.push({
      userId: userId || `usr-${Date.now()}`,
      email: userEmail.toLowerCase(),
      name: userName || 'Voter',
      selectedOptionId: optionId,
      votedAt: new Date().toISOString()
    });

    // Record feedback if provided
    if (feedbackComment && feedbackComment.trim()) {
      poll.feedback.push({
        id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        voterName: userName || 'Anonymous Voter',
        voterEmail: userEmail.toLowerCase(),
        comment: feedbackComment.trim(),
        createdAt: new Date().toISOString()
      });
    }

    db.save();
    return poll;
  }

  static async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }
}

module.exports = Poll;

