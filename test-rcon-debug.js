const { client: RconClient } = require('astroneer-rcon-client');

console.log('Attempting RCON connection...');
console.log('Host: 127.0.0.1');
console.log('Port: 8778');
console.log('Password: madAdmin');
console.log('');

const rcon = new RconClient({
  ip: '127.0.0.1',
  port: 8778,
  password: 'madAdmin'
});

rcon.on('authenticated', () => {
  console.log('✅ SUCCESS: Authenticated with RCON server');
  process.exit(0);
});

rcon.on('error', (err) => {
  console.log('❌ ERROR EVENT:', err);
  console.log('Error type:', typeof err);
  console.log('Error message:', err ? err.message : 'undefined');
  console.log('Error stack:', err ? err.stack : 'no stack');
  process.exit(1);
});

rcon.on('connect', () => {
  console.log('🔌 TCP connection established');
});

rcon.on('close', () => {
  console.log('🔌 Connection closed');
});

console.log('Calling rcon.connect()...');
rcon.connect();

setTimeout(() => {
  console.log('⏱️  TIMEOUT: No response after 10 seconds');
  process.exit(1);
}, 10000);
