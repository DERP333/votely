const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[35m%s\x1b[0m', '══════════════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '  🚀 Starting Votely - Full-Stack Real-Time Polling Platform');
console.log('\x1b[35m%s\x1b[0m', '══════════════════════════════════════════════════════════════════');

const serverDir = path.join(__dirname, 'server');
const clientDir = path.join(__dirname, 'client');

// Start backend server
const serverProcess = spawn('node', ['server.js'], {
  cwd: serverDir,
  stdio: 'pipe',
  env: { ...process.env, PORT: 5002 }
});

serverProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[Server]\x1b[0m ${data.toString()}`);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Server Error]\x1b[0m ${data.toString()}`);
});

// Start frontend client (vite)
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: clientDir,
  stdio: 'pipe',
  env: process.env,
  shell: true
});

clientProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[Client]\x1b[0m ${data.toString()}`);
});

clientProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[Client Info]\x1b[0m ${data.toString()}`);
});

const cleanup = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down Votely development servers...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
