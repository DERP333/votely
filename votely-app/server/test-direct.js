const User = require('./models/User');
const Poll = require('./models/Poll');
const { generateCode } = require('./utils/generateCode');

async function testInProcess() {
  console.log('🧪 Starting Direct In-Process Controller & Model Test Suite...\n');

  // Test 1: Code Generator
  console.log('1️⃣ Testing Secret Code Generation...');
  const code = generateCode('VOTE', 4);
  console.log('   Generated Code:', code);
  if (!code.startsWith('VOTE-') || code.length !== 9) {
    throw new Error('Code generator format invalid');
  }
  console.log('   ✅ Code generator verified.');

  // Test 2: User Model Creation & Finding
  console.log('\n2️⃣ Testing User Registration & Model Operations...');
  const testEmail = `voter_${Date.now()}@votely.io`;
  const newUser = await User.create({
    name: 'Elena Rostova',
    gender: 'Female',
    mobile: '9876543210',
    email: testEmail,
    voterId: 'VT-2024-9988'
  });
  console.log('   Created user:', newUser.name, newUser.email, newUser.id);

  const foundUser = await User.findOne({ email: testEmail });
  if (!foundUser || foundUser.name !== 'Elena Rostova') {
    throw new Error('User lookup failed');
  }
  console.log('   ✅ User lookup verified.');

  // Test 3: Poll Creation
  console.log('\n3️⃣ Testing Poll Creation & Option Initialization...');
  const pollCode = generateCode('VOTE', 4);
  const newPoll = await Poll.create({
    code: pollCode,
    question: 'Who should be the Campus Council President?',
    description: 'Election for student leadership.',
    creatorEmail: testEmail,
    creatorName: 'Elena Rostova',
    options: ['Marcus Vance', 'Liam Gallagher', 'Sophia Chen'],
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString()
  });

  console.log('   Poll created with ID:', newPoll.id, 'Code:', newPoll.code);
  console.log('   Options count:', newPoll.options.length);
  if (newPoll.options.length !== 3 || newPoll.options[0].votes !== 0) {
    throw new Error('Poll options not correctly initialized');
  }
  console.log('   ✅ Poll creation verified.');

  // Test 4: Casting Ballot with Strict One-Vote Enforcement
  console.log('\n4️⃣ Testing Ballot Casting & Feedback...');
  const selectedOption = newPoll.options[0].id;
  const updatedPoll = await Poll.addVote(newPoll.id, {
    userEmail: testEmail,
    userName: 'Elena Rostova',
    userId: newUser.id,
    optionId: selectedOption,
    feedbackComment: 'Marcus has the strongest agenda for campus technology.'
  });

  const votedOption = updatedPoll.options.find(o => o.id === selectedOption);
  console.log(`   Option "${votedOption.text}" votes: ${votedOption.votes}`);
  console.log(`   Voters count: ${updatedPoll.voters.length}`);
  console.log(`   Feedback count: ${updatedPoll.feedback.length}`);
  if (votedOption.votes !== 1 || updatedPoll.feedback.length !== 1) {
    throw new Error('Vote counting or feedback recording failed');
  }
  console.log('   ✅ Ballot casting verified.');

  // Test 5: Strict Duplicate Vote Prevention
  console.log('\n5️⃣ Testing Strict One-Vote-Per-User Prevention...');
  let caughtDuplicate = false;
  try {
    await Poll.addVote(newPoll.id, {
      userEmail: testEmail,
      userName: 'Elena Rostova',
      userId: newUser.id,
      optionId: newPoll.options[1].id
    });
  } catch (err) {
    caughtDuplicate = true;
    console.log('   🛡️ Prevented duplicate vote:', err.message);
  }

  if (!caughtDuplicate) {
    throw new Error('Strict one-vote policy failed to block duplicate voter!');
  }
  console.log('   ✅ One-Vote-Per-User strictly enforced!');

  // Test 6: Querying Polls with Filters
  console.log('\n6️⃣ Testing Poll Queries & Filtering...');
  const activePolls = await Poll.find({ status: 'Active' });
  console.log(`   Active polls found: ${activePolls.length}`);
  const myPolls = await Poll.find({ creatorEmail: testEmail });
  console.log(`   Polls created by ${testEmail}: ${myPolls.length}`);
  if (myPolls.length < 1) {
    throw new Error('Filter by creatorEmail failed');
  }
  console.log('   ✅ Poll queries verified.');

  console.log('\n🎉 ALL DIRECT UNIT & INTEGRATION TESTS PASSED CLEANLY!\n');
}

testInProcess().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

