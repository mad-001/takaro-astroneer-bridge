# Takaro Astroneer Bridge

Connects your Astroneer dedicated server to Takaro using RCON. **No mods required.**

---

## Installation

### 1. Download
Go to [Releases](https://github.com/mad-001/takaro-astroneer-bridge/releases) and download `takaro-astroneer-bridge-windows.zip`

Extract it anywhere on your PC.

### 2. Enable RCON on Astroneer Server

Edit this file:
```
\astroneer\Astro\Saved\Config\WindowsServer\AstroServerSettings.ini
```

Add these two lines anywhere:
```ini
ConsolePort=5000
ConsolePassword=your-password-here
```

Restart your Astroneer server.

### 3. Configure the Bridge

Open `TakaroConfig.txt` in Notepad and edit:

```ini
IDENTITY_TOKEN=your-server-name
REGISTRATION_TOKEN=get-this-from-takaro-dashboard
RCON_PASSWORD=same-password-as-step-2
```

Save the file.

### 4. Start the Bridge

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

**"RCON connection failed"**
- Check that ConsolePort and ConsolePassword match in both files
- Make sure Astroneer server is running

**"Takaro connection failed"**
- Check IDENTITY_TOKEN and REGISTRATION_TOKEN in TakaroConfig.txt
- Get tokens from https://app.takaro.io/

**Bridge won't start**
- Install Node.js 18+ from https://nodejs.org/
- Restart your computer after installing

---

## What You Need

- Astroneer Dedicated Server (vanilla, no mods)
- Node.js 18+
- Takaro account at https://takaro.io

---

## Links

- [Takaro Platform](https://takaro.io)
- [GitHub Repository](https://github.com/mad-001/takaro-astroneer-bridge)
- [Report Issues](https://github.com/mad-001/takaro-astroneer-bridge/issues)
