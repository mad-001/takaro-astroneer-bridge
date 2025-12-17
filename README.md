# Takaro Astroneer Bridge

Connects your Astroneer dedicated server to Takaro using RCON. **No mods required.**

## 🎉 Latest Version: v1.11.7

**Real-time player events working perfectly!** Discord notifications and all hooks trigger within 1 second of players joining/leaving.

---

## Quick Start

### Step 1: Install Node.js

**Easy way:** Open PowerShell as Administrator and run:
```powershell
winget install OpenJS.NodeJS.LTS
```

**Or download:** https://nodejs.org/

**⚠️ RESTART YOUR COMPUTER after installing!**

### Step 2: Download the Bridge

Go to [Releases](https://github.com/mad-001/takaro-astroneer-bridge/releases/latest) and download `takaro-astroneer-bridge-v1.11.7-windows.zip`

Extract it anywhere on your PC.

### Step 3: Install Dependencies

Open PowerShell or Command Prompt in the extracted folder and run:
```
npm install
```

This will download all required packages (takes a few minutes).

### Step 4: Enable RCON on Astroneer Server

Edit this file on your Astroneer server:
```
\astroneer\Astro\Saved\Config\WindowsServer\AstroServerSettings.ini
```

Add these lines:
```ini
ConsolePort=5000
ConsolePassword=your-password-here
```

**Save and restart your Astroneer server.**

### Step 5: Configure the Bridge

Open `TakaroConfig.txt` in Notepad and edit:

```ini
IDENTITY_TOKEN=your-server-name
REGISTRATION_TOKEN=get-this-from-takaro-dashboard
RCON_PASSWORD=same-password-as-step-3
```

**Get your REGISTRATION_TOKEN from:** Takaro Dashboard → Your Server → Settings → Connection Token

Save the file.

### Step 6: Start the Bridge

Double-click `start.bat`

You should see:
```
✓ Connected to Takaro WebSocket
✓ Connected to Astroneer RCON
✓ HTTP API listening on http://127.0.0.1:3535
```

**Done!** Your server is now connected to Takaro with real-time player events.

---

## Features

✅ **Real-time player events** - Connect/disconnect events within 1 second
✅ **Discord notifications** - Instant notifications for player join/leave
✅ **Full RCON support** - Execute any Astroneer server command
✅ **Server management** - Kick, ban, unban players
✅ **Auto-reconnect** - Automatically reconnects if connection drops
✅ **Event hooks** - Trigger custom actions on player events

---

## Usage

### Start the Bridge
Double-click `start.bat` or run:
```
node dist/index.js
```

### Stop the Bridge
Double-click `stop.bat` or press `Ctrl+C` in the terminal

### Restart the Bridge
Double-click `restart_bridge.vbs` for a clean restart

---

## Troubleshooting

### "node is not recognized"
- Install Node.js from https://nodejs.org/
- **Restart your computer** after installing

### "Cannot find module"
- Run `npm install` in the bridge folder

### "RCON connection failed"
- Check that `RCON_PASSWORD` in TakaroConfig.txt matches your AstroServerSettings.ini
- Make sure your Astroneer server is running
- Verify ConsolePort is set to 5000 (or update RCON_PORT in TakaroConfig.txt)

### "Takaro connection failed"
- Check your `REGISTRATION_TOKEN` in TakaroConfig.txt
- Get a new token from Takaro Dashboard → Your Server → Settings

### Events not appearing in Discord
- Make sure your Discord hook is configured in Takaro for player-connected/player-disconnected events
- Check Takaro Dashboard → Events to verify events are being created
- See bridge logs in `takaro-bridge.log` for debugging

---

## Getting Takaro Access

Takaro is currently invite-only. To get access:

1. Go to [Takaro.io](https://takaro.io) and complete the interest survey
2. Join the [Takaro Discord server](https://discord.gg/takaro)
3. Request an invite from the team

---

## Links

- **Documentation:** https://mad-001.github.io/takaro-astroneer-bridge/
- **Report Issues:** https://github.com/mad-001/takaro-astroneer-bridge/issues
- **Takaro Platform:** https://takaro.io
- **Takaro Dashboard:** https://app.takaro.io

---

## Technical Details

- **Bridge Type:** External WebSocket connector
- **Connection:** WebSocket to wss://connect.takaro.io/
- **RCON Protocol:** Native Astroneer RCON
- **Event Latency:** < 1 second
- **Supported Versions:** Node.js 18+

---

## License

MIT License - See LICENSE file for details

## Credits

Developed with assistance from Claude Code
