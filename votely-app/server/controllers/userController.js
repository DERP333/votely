const User = require('../models/User');
const Poll = require('../models/Poll');

// Register / Onboard user
exports.registerUser = async (req, res) => {
  try {
    const { name, gender, mobile, email, voterId } = req.body;

    if (!name || !gender || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, gender, mobile number, and email address.'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Basic mobile validation (at least 7 to 15 digits)
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 8 || cleanMobile.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid mobile number (10 digits recommended).'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      // Update details if they are returning
      user = await User.findByIdAndUpdate(user.id, {
        name,
        gender,
        mobile,
        voterId: voterId || user.voterId
      });
    } else {
      user = await User.create({
        name,
        gender,
        mobile,
        email,
        voterId
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User registered successfully.',
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration.',
      error: err.message
    });
  }
};

// Get User Profile with Activity Stats
exports.getUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Calculate user activity stats
    const allPolls = await Poll.find();
    const pollsCreated = allPolls.filter(p => p.creatorEmail.toLowerCase() === email.toLowerCase());
    const pollsVoted = allPolls.filter(p => (p.voters || []).some(v => v.email.toLowerCase() === email.toLowerCase()));

    const stats = {
      pollsCreatedCount: pollsCreated.length,
      pollsVotedCount: pollsVoted.length,
      createdPolls: pollsCreated.map(p => ({
        id: p.id,
        code: p.code,
        question: p.question,
        status: p.status,
        totalVotes: (p.options || []).reduce((sum, o) => sum + (o.votes || 0), 0),
        createdAt: p.createdAt
      })),
      votedPolls: pollsVoted.map(p => {
        const myVote = (p.voters || []).find(v => v.email.toLowerCase() === email.toLowerCase());
        const selectedOption = (p.options || []).find(o => o.id === myVote?.selectedOptionId);
        return {
          id: p.id,
          code: p.code,
          question: p.question,
          status: p.status,
          votedAt: myVote?.votedAt,
          selectedOptionText: selectedOption ? selectedOption.text : 'Unknown'
        };
      })
    };

    return res.status(200).json({
      success: true,
      user,
      stats
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
      error: err.message
    });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const { name, mobile, gender, voterId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updatedUser = await User.findByIdAndUpdate(user.id, {
      ...(name && { name }),
      ...(mobile && { mobile }),
      ...(gender && { gender }),
      ...(voterId !== undefined && { voterId })
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: err.message
    });
  }
};

