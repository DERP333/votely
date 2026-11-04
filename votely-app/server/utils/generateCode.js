/**
 * Generates a unique alphanumeric code for polls.
 * Example output: "VOTE-89X2" or custom length alphanumeric string.
 */
function generateCode(prefix = 'VOTE', length = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars like 0/O, 1/I
  let randomPart = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars.charAt(randomIndex);
  }
  return prefix ? `${prefix}-${randomPart}` : randomPart;
}

module.exports = {
  generateCode
};

