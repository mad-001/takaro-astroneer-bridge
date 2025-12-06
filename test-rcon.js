#!/usr/bin/env node

/**
 * Simple RCON test utility for Astroneer
 * Usage: node test-rcon.js [command]
 *
 * Examples:
 *   node test-rcon.js players        - List all players
 *   node test-rcon.js info            - Get server info
 *   node test-rcon.js saves           - List save games
 *   node test-rcon.js raw "DSServerStatistics" - Send raw RCON command
 */

const { client: RconClient } = require('astroneer-rcon-client');
const fs = require('fs');
const path = require('path');

// Read config from TakaroConfig.txt
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
    console.error('Failed to load TakaroConfig.txt:', error.message);
    process.exit(1);
  }

  return config;
}

async function main() {
  const command = process.argv[2] || 'help';

  // Handle help without connecting
  if (command.toLowerCase() === 'help') {
    console.log('Available commands:');
    console.log('  players    - List all players');
    console.log('  info       - Get server information');
    console.log('  saves      - List save games');
    console.log('  raw <cmd>  - Send raw RCON command');
    console.log('');
    console.log('Examples:');
    console.log('  node test-rcon.js players');
    console.log('  node test-rcon.js info');
    console.log('  node test-rcon.js raw "DSServerStatistics"');
    return;
  }

  const config = loadConfig();

  console.log('Connecting to RCON...');
  console.log(`Host: ${config.RCON_HOST}:${config.RCON_PORT}`);
  console.log('');

  const rcon = new RconClient({
    host: config.RCON_HOST,
    port: parseInt(config.RCON_PORT),
    password: config.RCON_PASSWORD
  });

  try {
    // Connect
    await new Promise((resolve, reject) => {
      rcon.on('authenticated', resolve);
      rcon.on('error', reject);
      rcon.connect();
    });

    console.log('✅ Connected to RCON\n');

    // Execute command
    switch (command.toLowerCase()) {

      case 'players':
        console.log('Getting player list...\n');
        const players = await rcon.listPlayers();
        console.log(`Total players: ${players.length}`);
        console.log(`Online: ${players.filter(p => p.inGame).length}\n`);

        players.forEach((player, i) => {
          console.log(`Player ${i + 1}:`);
          console.log(`  Name: ${player.name}`);
          console.log(`  GUID: ${player.guid}`);
          console.log(`  Category: ${player.category}`);
          console.log(`  In Game: ${player.inGame}`);
          console.log('');
        });
        break;

      case 'info':
        console.log('Getting server info...\n');
        const info = await rcon.getInfo();
        console.log('Server Information:');
        console.log(`  Name: ${info.name}`);
        console.log(`  Version: ${info.version}`);
        console.log(`  URL: ${info.url}`);
        console.log(`  Players: ${info.onlinePlayers}/${info.maxPlayers}`);
        console.log(`  Known Players: ${info.knownPlayers}`);
        console.log(`  FPS: ${info.fps.toFixed(1)}`);
        console.log(`  Time Played: ${Math.floor(info.timePlayed / 3600)}h ${Math.floor((info.timePlayed % 3600) / 60)}m`);
        console.log(`  Password Protected: ${info.passwordProtected}`);
        console.log(`  Whitelist: ${info.whitelistEnabled}`);
        console.log(`  Achievements: ${info.achievementsEnabled}`);
        console.log('');
        console.log('Active Save:');
        console.log(`  Name: ${info.save.name}`);
        console.log(`  Creative: ${info.save.creative}`);
        console.log(`  Last Edited: ${info.save.lastEdited}`);
        console.log('');
        if (info.owner) {
          console.log('Owner:');
          console.log(`  Name: ${info.owner.name}`);
          console.log(`  GUID: ${info.owner.guid}`);
          console.log(`  Online: ${info.owner.inGame}`);
        }
        break;

      case 'saves':
        console.log('Getting save list...\n');
        const saves = await rcon.listSaves();
        console.log(`Total saves: ${saves.list.length}`);
        console.log(`Active: ${saves.active.name}\n`);

        saves.list.forEach((save, i) => {
          console.log(`Save ${i + 1}:`);
          console.log(`  Name: ${save.name}`);
          console.log(`  Creative: ${save.creative}`);
          console.log(`  Last Edited: ${save.lastEdited}`);
          console.log(`  ${save.name === saves.active.name ? '⭐ ACTIVE' : ''}`);
          console.log('');
        });
        break;

      case 'raw':
        const rawCmd = process.argv[3];
        if (!rawCmd) {
          console.error('Error: Raw command requires a parameter');
          console.log('Usage: node test-rcon.js raw "CommandName"');
          process.exit(1);
        }
        console.log(`Sending raw command: ${rawCmd}\n`);
        const result = await rcon.sendRaw(rawCmd);
        console.log('Response:');
        console.log(JSON.stringify(result, null, 2));
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "node test-rcon.js help" for available commands');
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rcon.disconnect();
  }
}

main();
