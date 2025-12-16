# Takaro Astroneer Bridge

Connects your Astroneer dedicated server to Takaro using RCON. **No mods required.**

## 🎉 Latest Version: v1.11.3

**New in v1.11.3:** Window auto-closes when bridge stops - no more orphaned command windows!

**In v1.11.2:** Proper server shutdown handling! When using Takaro's `serverShutdown` command, the bridge now waits 20 seconds then forcefully kills Astroneer processes, allowing clean restarts without orphaned processes.

**Player Events Working!** This version works with the new **Astroneer Player Event Generator** module that automatically creates player-connected and player-disconnected events in Takaro.

**How it works:**
- The bridge reports online players via `getPlayers` responses
- Takaro tracks player online status automatically
- A Takaro module monitors status changes and generates events every minute
- Your Discord notifications and other hooks work perfectly!

---

## Installation

### Step 1: Install Node.js

**Easy way:** Open PowerShell as Administrator and run:
```powershell
winget install OpenJS.NodeJS.LTS
```

**Or download:** https://nodejs.org/

**Restart your computer after installing.**

### Step 2: Download the Bridge

Go to [Releases](https://github.com/mad-001/takaro-astroneer-bridge/releases) and download `takaro-astroneer-bridge-windows.zip`

Extract it anywhere on your PC.

### Step 3: Enable RCON on Astroneer Server

Edit this file on your Astroneer server:
```
\astroneer\Astro\Saved\Config\WindowsServer\AstroServerSettings.ini
```

Add these two lines anywhere:
```ini
ConsolePort=5000
ConsolePassword=your-password-here
```

Save and restart your Astroneer server.

### Step 4: Configure the Bridge

Open `TakaroConfig.txt` in Notepad and edit:

```ini
IDENTITY_TOKEN=your-server-name
REGISTRATION_TOKEN=get-this-from-takaro-dashboard
RCON_PASSWORD=same-password-as-step-3
```

Save the file.

### Step 5: Start the Bridge

Double-click `start.bat`

You should see:
```
✓ Connected to Takaro WebSocket
✓ Connected to Astroneer RCON
```

**Done!** Your server is now connected to Takaro.

### Step 6: Install the Player Event Generator Module

To get player connect/disconnect events working:

1. Go to your [Takaro Dashboard](https://app.takaro.io/)
2. Navigate to **Modules** → **Browse Modules**
3. Find and install **"Astroneer Player Event Generator"** by Claude
4. Select your Astroneer server and click **Install**

This module will automatically:
- Monitor player online status changes
- Create player-connected events when players join
- Create player-disconnected events when players leave
- Trigger your Discord notifications and other hooks

**Note:** Events are detected every minute (there may be up to 60 seconds delay).

---

## Stop the Bridge

Double-click `stop.bat`

---

## Troubleshooting

**"Publisher cannot be verified" security warning**
- This is normal for downloaded files
- Click **"More info"** then **"Run anyway"**
- OR: Right-click start.bat → Properties → Check "Unblock" → Apply → OK

**"node is not recognized"**
- Install Node.js from https://nodejs.org/
- Restart your computer after installing

**"RCON connection failed"**
- Check that ConsolePort and ConsolePassword match in both files
- Make sure Astroneer server is running

**"Takaro connection failed"**
- Check IDENTITY_TOKEN and REGISTRATION_TOKEN in TakaroConfig.txt
- Get tokens from https://app.takaro.io/

---

## What You Need

- Astroneer Dedicated Server running
- Node.js 18+
- Takaro account at https://takaro.io

---

## Links

- [Takaro Platform](https://takaro.io)
- [Get Tokens](https://app.takaro.io/)
- [Report Issues](https://github.com/mad-001/takaro-astroneer-bridge/issues)
