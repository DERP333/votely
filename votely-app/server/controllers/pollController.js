const Poll = require('../models/Poll');
const { generateCode } = require('../utils/generateCode');

// Helper to get socket.io instance attached to req.app
const getIO = (req) => req.app.get('io');

// Get all polls with optional filtering
exports.getAllPolls = async (req, res) => {
  try {
    const { status, creatorEmail, voterEmail, search } = req.query;
    const polls = await Poll.find({ status, creatorEmail, voterEmail, search });

    // Format summary for list views
    const formatted = polls.map(p => {
      const totalVotes = (p.options || []).reduce((acc, opt) => acc + (opt.votes || 0), 0);
      let userVotedOptionId = null;

      if (voterEmail) {
        const voter = (p.voters || []).find(v => v.email.toLowerCase() === voterEmail.toLowerCase());
        if (voter) userVotedOptionId = voter.selectedOptionId;
      }

      return {
        id: p.id,
        code: p.code,
        question: p.question,
        description: p.description,
        creatorName: p.creatorName,
        creatorEmail: p.creatorEmail,
        status: p.status,
        expiresAt: p.expiresAt,
        createdAt: p.createdAt,
        optionsCount: (p.options || []).length,
        totalVotes,
        feedbackCount: (p.feedback || []).length,
        userHasVoted: !!userVotedOptionId,
        userVotedOptionId
      };
    });

    return res.status(200).json({ success: true, polls: formatted });
  } catch (err) {
    console.error('Get all polls error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve polls.' });
  }
};

// Get single poll by ID or by Secret Code
exports.getPollDetails = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be poll id or secret code
    const { voterEmail } = req.query;

    let poll = null;
    if (identifier.toUpperCase().startsWith('VOTE-')) {
      poll = await Poll.findByCode(identifier);
    } else {
      poll = await Poll.findById(identifier);
      if (!poll) {
        poll = await Poll.findByCode(identifier);
      }
    }

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found with this code or ID.' });
    }

    const totalVotes = (poll.options || []).reduce((acc, opt) => acc + (opt.votes || 0), 0);

    // Calculate percentages
    const optionsWithPercentages = (poll.options || []).map(opt => ({
      ...opt,
      percentage: totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0
    }));

    // Check if voter has already voted
    let userVoted = false;
    let userVotedOptionId = null;
    if (voterEmail) {
      const voterRecord = (poll.voters || []).find(v => v.email.toLowerCase() === voterEmail.toLowerCase());
      if (voterRecord) {
        userVoted = true;
        userVotedOptionId = voterRecord.selectedOptionId;
      }
    }

    return res.status(200).json({
      success: true,
      poll: {
        ...poll,
        options: optionsWithPercentages,
        totalVotes,
        userVoted,
        userVotedOptionId
      }
    });
  } catch (err) {
    console.error('Get poll details error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch poll details.' });
  }
};

// Create a new poll
exports.createPoll = async (req, res) => {
  try {
    const { question, description, options, expiresAt, durationHours, creatorEmail, creatorName } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Poll question or title is required.' });
    }

    // Filter valid options
    const cleanOptions = (Array.isArray(options) ? options : [])
      .map(o => (typeof o === 'string' ? o.trim() : (o.text || '').trim()))
      .filter(o => o.length > 0);

    if (cleanOptions.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'A poll must have at least 2 distinct voting options.'
      });
    }

    // Determine expiration
    let finalExpiry = expiresAt;
    if (!finalExpiry && durationHours) {
      finalExpiry = new Date(Date.now() + parseInt(durationHours) * 3600000).toISOString();
    } else if (!finalExpiry) {
      // Default: 48 hours
      finalExpiry = new Date(Date.now() + 48 * 3600000).toISOString();
    }

    // Generate unique code (e.g., VOTE-89X2)
    let secretCode = generateCode('VOTE', 4);
    // Ensure uniqueness
    let existing = await Poll.findByCode(secretCode);
    let attempts = 0;
    while (existing && attempts < 10) {
      secretCode = generateCode('VOTE', 4);
      existing = await Poll.findByCode(secretCode);
      attempts++;
    }

    const newPoll = await Poll.create({
      code: secretCode,
      question: question.trim(),
      description: (description || '').trim(),
      creatorEmail: creatorEmail || 'anonymous@votely.io',
      creatorName: creatorName || 'Organizer',
      options: cleanOptions,
      expiresAt: finalExpiry
    });

    // Notify all connected clients via Socket.io
    const io = getIO(req);
    if (io) {
      io.emit('poll_created', {
        id: newPoll.id,
        code: newPoll.code,
        question: newPoll.question,
        status: newPoll.status,
        createdAt: newPoll.createdAt
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Poll created successfully!',
      poll: newPoll,
      secretCode: newPoll.code
    });
  } catch (err) {
    console.error('Create poll error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create poll.', error: err.message });
  }
};

// Vote in a poll (Strict One-Vote-Per-User enforcement)
exports.voteInPoll = async (req, res) => {
  try {
    const { pollId, code, selectedOptionId, userEmail, userName, userId, feedback } = req.body;

    if (!selectedOptionId) {
      return res.status(400).json({ success: false, message: 'Please select an option to cast your vote.' });
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Voter email is required to prevent duplicate votes.' });
    }

    // Find the poll either by ID or by Code
    let poll = null;
    if (pollId) {
      poll = await Poll.findById(pollId);
    } else if (code) {
      poll = await Poll.findByCode(code);
    }

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found. Please verify the poll ID or Secret Code.' });
    }

    // Cast vote with atomic checks
    const updatedPoll = await Poll.addVote(poll.id, {
      userEmail,
      userName: userName || userEmail.split('@')[0],
      userId,
      optionId: selectedOptionId,
      feedbackComment: feedback
    });

    const totalVotes = (updatedPoll.options || []).reduce((acc, opt) => acc + (opt.votes || 0), 0);
    const optionsWithPercentages = (updatedPoll.options || []).map(opt => ({
      ...opt,
      percentage: totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0
    }));

    const responsePayload = {
      ...updatedPoll,
      options: optionsWithPercentages,
      totalVotes,
      userVoted: true,
      userVotedOptionId: selectedOptionId
    };

    // Emit live update to all sockets
    const io = getIO(req);
    if (io) {
      io.emit('poll_updated', {
        pollId: updatedPoll.id,
        code: updatedPoll.code,
        totalVotes,
        options: optionsWithPercentages,
        feedbackCount: (updatedPoll.feedback || []).length,
        recentFeedback: feedback ? {
          voterName: userName || userEmail.split('@')[0],
          comment: feedback.trim(),
          createdAt: new Date().toISOString()
        } : null
      });

      io.to(`poll_${updatedPoll.id}`).emit('live_vote_cast', responsePayload);
    }

    return res.status(200).json({
      success: true,
      message: 'Your vote has been counted successfully!',
      poll: responsePayload
    });
  } catch (err) {
    console.warn('Voting restriction error:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'Unable to record your vote.'
    });
  }
};

// Get Dashboard KPI Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const { email } = req.query;
    const allPolls = await Poll.find();

    const totalPolls = allPolls.length;
    let totalVotesCast = 0;
    let activePollsCount = 0;
    let expiredPollsCount = 0;

    allPolls.forEach(p => {
      const votes = (p.options || []).reduce((sum, o) => sum + (o.votes || 0), 0);
      totalVotesCast += votes;
      if (p.status === 'Active') {
        activePollsCount++;
      } else {
        expiredPollsCount++;
      }
    });

    let userStats = null;
    if (email) {
      const myCreated = allPolls.filter(p => p.creatorEmail.toLowerCase() === email.toLowerCase());
      const myVoted = allPolls.filter(p => (p.voters || []).some(v => v.email.toLowerCase() === email.toLowerCase()));
      userStats = {
        myPollsCount: myCreated.length,
        myVotesCount: myVoted.length
      };
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalPolls,
        totalVotesCast,
        activePollsCount,
        expiredPollsCount,
        userStats
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
};

