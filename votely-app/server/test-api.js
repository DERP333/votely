const http = require('http');

// Helper to make local HTTP requests
function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Votely API & Feature Requirements Verification...\n');

  // Test 1: User Registration (Screen 2: User Onboarding)
  console.log('1️⃣ Testing User Registration / Onboarding...');
  const regRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/users/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Sarah Connor',
    gender: 'Female',
    mobile: '9876543210',
    email: 'sarah.connor@test.com',
    voterId: 'VT-TEST-9921'
  });

  if (regRes.status !== 200 || !regRes.body.success) {
    throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
  }
  console.log('   ✅ User registered successfully:', regRes.body.user.name, `(${regRes.body.user.email})`);

  // Test 2: Create a Poll (Feature A: Create a Poll & Auto-Generated Code)
  console.log('\n2️⃣ Testing Poll Creation & Auto-Generated Secret Code...');
  const createRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/polls/create',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    question: 'Should the campus library remain open 24/7 during final exam week?',
    description: 'Student Union annual referendum question.',
    options: ['Yes, 24/7 with badge access', 'No, regular hours are sufficient', 'Hybrid: open late until 2 AM'],
    durationHours: 48,
    creatorEmail: 'sarah.connor@test.com',
    creatorName: 'Sarah Connor'
  });

  if (createRes.status !== 201 || !createRes.body.success) {
    throw new Error(`Create poll failed: ${JSON.stringify(createRes.body)}`);
  }
  const poll = createRes.body.poll;
  const secretCode = createRes.body.secretCode;
  console.log(`   ✅ Poll created successfully!`);
  console.log(`   🔑 Secret Code Generated: ${secretCode}`);
  console.log(`   📝 Question: "${poll.question}"`);
  console.log(`   📋 Options count: ${poll.options.length}`);

  // Test 3: Participate in Polling (Feature B: Participate & Strict 1-Vote Enforcement)
  console.log('\n3️⃣ Testing Ballot Casting & Optional Feedback...');
  const optionToVote = poll.options[0].id;
  const voteRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/polls/vote',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    pollId: poll.id,
    code: secretCode,
    selectedOptionId: optionToVote,
    userEmail: 'sarah.connor@test.com',
    userName: 'Sarah Connor',
    feedback: '24/7 study access will significantly help STEM and medical students.'
  });

  if (voteRes.status !== 200 || !voteRes.body.success) {
    throw new Error(`Vote failed: ${JSON.stringify(voteRes.body)}`);
  }
  console.log('   ✅ First ballot recorded successfully!');
  console.log(`   📊 Total votes now: ${voteRes.body.poll.totalVotes}`);

  // Test 4: Strict One-Vote-Per-User Prevention Test
  console.log('\n4️⃣ Testing Strict One-Vote-Per-User Restriction (Duplicate attempt)...');
  const duplicateVoteRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: '/api/polls/vote',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    pollId: poll.id,
    code: secretCode,
    selectedOptionId: poll.options[1].id,
    userEmail: 'sarah.connor@test.com',
    userName: 'Sarah Connor'
  });

  if (duplicateVoteRes.status === 400 && duplicateVoteRes.body.message.includes('already cast')) {
    console.log('   🛡️ PASS: Duplicate voting prevented! Error:', duplicateVoteRes.body.message);
  } else {
    throw new Error(`Expected 400 duplicate vote restriction, got ${duplicateVoteRes.status}: ${JSON.stringify(duplicateVoteRes.body)}`);
  }

  // Test 5: Query Poll History & Analytics (Feature C)
  console.log('\n5️⃣ Testing Poll Analytics & History Fetching...');
  const detailsRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: `/api/polls/${secretCode}?voterEmail=sarah.connor@test.com`,
    method: 'GET'
  });

  if (detailsRes.status !== 200 || !detailsRes.body.success) {
    throw new Error(`Fetch details failed: ${JSON.stringify(detailsRes.body)}`);
  }
  const pollDetails = detailsRes.body.poll;
  console.log(`   ✅ Analytics details retrieved:`);
  console.log(`   - Total Votes: ${pollDetails.totalVotes}`);
  console.log(`   - User Has Voted: ${pollDetails.userVoted}`);
  console.log(`   - Feedback Count: ${pollDetails.feedback.length}`);
  console.log(`   - Options with %:`, pollDetails.options.map(o => `${o.text}: ${o.votes} (${o.percentage}%)`));

  // Test 6: User Profile & Stats (Feature D)
  console.log('\n6️⃣ Testing User Profile & Personal Activity Stats...');
  const profileRes = await request({
    hostname: 'localhost',
    port: 5002,
    path: `/api/users/profile/sarah.connor@test.com`,
    method: 'GET'
  });

  if (profileRes.status !== 200 || !profileRes.body.success) {
    throw new Error(`Profile fetch failed: ${JSON.stringify(profileRes.body)}`);
  }
  console.log(`   ✅ Profile fetched:`);
  console.log(`   - Polls Created Count: ${profileRes.body.stats.pollsCreatedCount}`);
  console.log(`   - Polls Voted Count: ${profileRes.body.stats.pollsVotedCount}`);

  console.log('\n🎉 ALL 6 FEATURE SPECIFICATION TESTS PASSED WITH 100% SUCCESS!\n');
  process.exit(0);
}

// Start server in background for testing and execute tests
const server = require('./server');
setTimeout(() => {
  runTests().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}, 800);

