const { client: RconClient } = require('astroneer-rcon-client');
const fs = require('fs');
const path = require('path');

function loadConfig() {
  const configPath = path.join(__dirname, 'TakaroConfig.txt');
  const config = {};
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          config[key.trim()] = value.trim();
        }
      }
    });
  } catch (error) {
    console.error('Failed to load config:', error.message);
    process.exit(1);
  }
  return config;
}

async function test() {
  const config = loadConfig();
  console.log('Connecting to RCON...');
  
  const rcon = new RconClient({
    ip: config.RCON_HOST,
    port: parseInt(config.RCON_PORT),
    password: config.RCON_PASSWORD
  });

  await new Promise((resolve, reject) => {
    rcon.on('connected', resolve);
    rcon.on('error', reject);
    rcon.connect();
    setTimeout(() => reject(new Error('Timeout')), 10000);
  });

  console.log('Connected! Sending DSListPlayers...');
  
  const result = await rcon.sendRaw('DSListPlayers');
  
  console.log('=== RESULT TYPE ===');
  console.log(typeof result);
  
  console.log('=== RESULT VALUE ===');
  console.log(result);
  
  console.log('=== RESULT STRINGIFIED ===');
  console.log(JSON.stringify(result, null, 2));
  
  console.log('\n=== Testing DSServerStatistics ===');
  const stats = await rcon.sendRaw('DSServerStatistics');
  console.log('Stats type:', typeof stats);
  console.log('Stats value:', stats);
  console.log('Stats JSON:', JSON.stringify(stats, null, 2));
  
  rcon.disconnect();
  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
