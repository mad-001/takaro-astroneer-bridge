#!/usr/bin/env node

/**
 * Interactive RCON Console for Astroneer
 * Connects to your Astroneer server and lets you send commands interactively
 */

const { client: RconClient } = require('astroneer-rcon-client');
const readline = require('readline');
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

// RCON command help reference
const COMMAND_HELP = {
  'help': 'Show this help message',
  'exit': 'Exit the console',
  'quit': 'Exit the console',
  'clear': 'Clear the console screen',
  '',
  '=== PLAYER COMMANDS ===': '',
  'ListPlayers': 'List all players and their status',
  'KickPlayerGuid <guid>': 'Kick a player by their GUID',
  'SetPlayerCategoryForPlayerGuid <guid> <category>': 'Change player role (Owner/Admin/Whitelisted/User)',
  '',
  '=== SERVER COMMANDS ===': '',
  'DSServerStatistics': 'Get detailed server statistics',
  'ServerShutdown': 'Shutdown the server',
  'SetServerName <name>': 'Change the server name',
  'SetPassword <password>': 'Set server password (empty to remove)',
  'SetDenyUnlisted <true|false>': 'Enable/disable whitelist',
  'SetActivityTimeout <seconds>': 'Set AFK timeout in seconds',
  'SetSaveGameInterval <seconds>': 'Set autosave interval in seconds',
  '',
  '=== SAVE GAME COMMANDS ===': '',
  'ListGames': 'List all save games',
  'SaveGame [name]': 'Save the current game (optional: with new name)',
  'LoadGame <name>': 'Load a save game',
  'NewGame <name>': 'Create a new game',
  'RenameGame <oldName> <newName>': 'Rename a save game',
  'DeleteGame <name>': 'Delete a save game',
  'CreativeMode': 'Toggle creative mode',
  '',
  '=== EXAMPLES ===': '',
  '  ListPlayers': '',
  '  KickPlayerGuid 403858294871376674': '',
  '  SetPassword mypassword123': '',
  '  SaveGame MyBackup': '',
  '  LoadGame SaveGame': '',
};

async function main() {
  const config = loadConfig();

  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         ASTRONEER INTERACTIVE RCON CONSOLE v1.0.0            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Connecting to RCON...');
  console.log(`Host: ${config.RCON_HOST}:${config.RCON_PORT}`);
  console.log('');

  const rcon = new RconClient({
    host: config.RCON_HOST,
    port: parseInt(config.RCON_PORT),
    password: config.RCON_PASSWORD
  });

  // Connect to RCON
  try {
    await new Promise((resolve, reject) => {
      rcon.on('authenticated', resolve);
      rcon.on('error', reject);
      rcon.connect();

      // Timeout after 10 seconds
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });

    console.log('✅ Connected successfully!\n');
    console.log('Type "help" for available commands, "exit" to quit.\n');

  } catch (error) {
    console.error('❌ Failed to connect:', error.message);
    console.log('\nTroubleshooting:');
    console.log('  1. Check that your Astroneer server is running');
    console.log('  2. Verify RCON settings in TakaroConfig.txt match AstroServerSettings.ini');
    console.log('  3. Ensure ConsolePort and ConsolePassword are set correctly');
    process.exit(1);
  }

  // Create readline interface for interactive input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'RCON> '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const command = line.trim();

    if (!command) {
      rl.prompt();
      return;
    }

    // Handle special commands
    if (command.toLowerCase() === 'exit' || command.toLowerCase() === 'quit') {
      console.log('\nDisconnecting...');
      rcon.disconnect();
      rl.close();
      process.exit(0);
    }

    if (command.toLowerCase() === 'clear') {
      console.clear();
      rl.prompt();
      return;
    }

    if (command.toLowerCase() === 'help') {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║                    AVAILABLE RCON COMMANDS                    ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');

      for (const [cmd, desc] of Object.entries(COMMAND_HELP)) {
        if (cmd === '') {
          console.log('');
        } else if (cmd.startsWith('===')) {
          console.log(`\n${cmd}`);
        } else if (desc === '') {
          console.log(`  ${cmd}`);
        } else {
          console.log(`  ${cmd.padEnd(50)} ${desc}`);
        }
      }
      console.log('');
      rl.prompt();
      return;
    }

    // Send command to RCON
    try {
      console.log('');
      const result = await rcon.sendRaw(command);

      // Format the output nicely
      if (result && typeof result === 'object') {
        console.log(JSON.stringify(result, null, 2));
      } else if (result) {
        console.log(result);
      } else {
        console.log('✓ Command executed successfully (no response)');
      }
      console.log('');

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye!');
    rcon.disconnect();
    process.exit(0);
  });

  // Handle CTRL+C
  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT. Disconnecting...');
    rcon.disconnect();
    rl.close();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
