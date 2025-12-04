# Takaro Astroneer Bridge

Connects your Astroneer dedicated server to Takaro using RCON. **No mods required.**

---

## Installation

### Step 1: Install Node.js

Download and install Node.js 18+ from https://nodejs.org/

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

---

## Stop the Bridge

Double-click `stop.bat`

---

## Troubleshooting

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
