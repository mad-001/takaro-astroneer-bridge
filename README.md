# Takaro Astroneer Bridge

A bridge server that connects Astroneer dedicated servers to Takaro's game server management platform using Astroneer's native RCON protocol.

## Features

- **Real-time Player Events**: Automatically detects and forwards player join/leave events to Takaro
- **Command Execution**: Execute server commands via Takaro (kick players, get player list, etc.)
- **Native RCON Integration**: Uses Astroneer's built-in RCON protocol - no mods required!
- **Metrics & Monitoring**: Built-in health endpoint with connection status and performance metrics
- **Automatic Reconnection**: Robust error handling with exponential backoff

## Architecture

```
Astroneer Dedicated Server (RCON)
         ↓
Takaro Bridge (Node.js)
         ↓
Takaro Platform (WebSocket)
```

The bridge connects to your Astroneer server's RCON interface and forwards events/commands between Astroneer and Takaro.

## Prerequisites

- Node.js 18+
- Astroneer Dedicated Server with RCON enabled
- Takaro account with game server registration

## Installation

### 1. Enable RCON on Astroneer Server

Edit your Astroneer server's `AstroServerSettings.ini` file (usually in `Astro/Saved/Config/WindowsServer/`):

```ini
[/Script/Astro.AstroServerSettings]
ConsolePort=5000
ConsolePassword=your-secure-password-here
```

Restart your Astroneer server for changes to take effect.

### 2. Install Bridge Server

```bash
git clone https://github.com/mad-001/takaro-astroneer-bridge.git
cd takaro-astroneer-bridge
npm install
npm run build
```

### 3. Configure Environment

Create a `.env` file:

```bash
# Takaro Configuration
IDENTITY_TOKEN=your-server-name
REGISTRATION_TOKEN=your-registration-token-from-takaro

# HTTP API Port (for backwards compatibility with Lua mod approach)
HTTP_PORT=3535

# Astroneer RCON Configuration
RCON_HOST=127.0.0.1
RCON_PORT=5000
RCON_PASSWORD=your-secure-password-here
```

Get your registration token from the Takaro dashboard when adding a new game server.

### 4. Start the Bridge

```bash
npm start
```

The bridge will:
1. Connect to Takaro's WebSocket server
2. Connect to your Astroneer server's RCON interface
3. Begin forwarding player events and processing commands

## Verification

Check the bridge is working:

```bash
curl http://127.0.0.1:3535/health
```

You should see:
```json
{
  "status": "ok",
  "takaroConnected": true,
  "rconConnected": true,
  "uptime": 123,
  "metrics": { ... }
}
```

## Supported Events

The bridge automatically forwards these events to Takaro:

- **player-connected**: When a player joins the server
- **player-disconnected**: When a player leaves the server

## Supported Commands

Takaro can execute these commands through the bridge:

- **testReachability**: Check if server is reachable
- **getPlayers**: Get list of currently connected players
- **kickPlayer**: Kick a player by their GUID

## Troubleshooting

### Bridge won't connect to RCON

- Verify `ConsolePort` and `ConsolePassword` in `AstroServerSettings.ini`
- Check Astroneer server is running and RCON is enabled
- Ensure firewall allows connections on RCON port

### Bridge won't connect to Takaro

- Verify `IDENTITY_TOKEN` and `REGISTRATION_TOKEN` in `.env`
- Check internet connectivity
- Review logs for connection errors

### Player events not appearing

- Verify RCON connection is established (`rconConnected: true` in health check)
- Check Astroneer server logs for RCON activity
- Ensure players are actually connecting (not just in the known players list)

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run tests (if available)
npm test
```

## Architecture Details

### RCON Protocol

The bridge uses the [astroneer-rcon-client](https://github.com/Esinko/AstroneerRconClient) library to communicate with Astroneer's RCON interface. This provides:

- Event-driven player join/leave notifications
- Command execution (kick, list players, server management)
- Automatic reconnection handling

### Takaro Protocol

The bridge implements Takaro's WebSocket protocol:

1. **Connection**: Connects to `wss://connect.takaro.io/`
2. **Identification**: Sends identity token and optional registration token
3. **Request/Response**: Handles bi-directional command execution
4. **Events**: Forwards game events to Takaro in real-time

## Backwards Compatibility

The bridge still includes HTTP endpoints for Lua mod integration:

- `POST /event` - Receive events from Lua mod
- `GET /poll` - Poll for pending commands
- `POST /result` - Submit command results

However, with RCON integration, these endpoints are no longer necessary.

## Running as Windows Service

To run as a Windows service, you can use tools like:
- `node-windows`: npm package for Windows services
- `NSSM` (Non-Sucking Service Manager): Free service manager

Example with NSSM:
```powershell
nssm install TakaroBridge "C:\Program Files\nodejs\node.exe" "C:\path\to\dist\index.js"
nssm set TakaroBridge AppDirectory "C:\path\to\takaro-astroneer-bridge"
nssm set TakaroBridge AppEnvironmentExtra "NODE_ENV=production"
nssm start TakaroBridge
```

## Contributing

Contributions welcome! This is an open-source project.

## License

MIT License - see LICENSE file for details

## Links

- [Takaro Platform](https://takaro.io)
- [Astroneer](https://astroneer.space)
- [GitHub Repository](https://github.com/mad-001/takaro-astroneer-bridge)
- [Astroneer RCON Client](https://github.com/Esinko/AstroneerRconClient)

## Acknowledgments

- Built for the [Takaro](https://takaro.io) platform
- Uses [astroneer-rcon-client](https://github.com/Esinko/AstroneerRconClient) by Esinko
- Inspired by the [Eco integration](https://github.com/takaro-io/takaro)
