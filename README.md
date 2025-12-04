# Takaro Astroneer Bridge

Bridge server that connects Astroneer (via UE4SS Lua mod) to Takaro WebSocket API.

## Architecture

```
Astroneer Server (UE4SS Lua Mod)
    ↕ HTTP (localhost:3000)
Bridge Server (Node.js)
    ↕ WebSocket
Takaro API
```

## Features

- ✅ Connects to Takaro WebSocket with identify/response handshake
- ✅ Exposes HTTP API for Lua mod on localhost:3000
- ✅ Forwards game events to Takaro
- ✅ Handles Takaro requests and commands
- ✅ Automatic reconnection to Takaro
- ✅ Logging to console and file

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - `TAKARO_WS_URL`: Takaro WebSocket URL
   - `IDENTITY_TOKEN`: Server identity token from Takaro
   - `REGISTRATION_TOKEN`: Registration token from Takaro
   - `HTTP_PORT`: Port for HTTP API (default: 3000)

4. Build:
```bash
npm run build
```

5. Run:
```bash
npm start
```

Or for development:
```bash
npm run dev
```

## HTTP API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "takaroConnected": true,
  "uptime": 123.45
}
```

### POST /event
Send game event to Takaro.

**Request:**
```json
{
  "type": "player-connected",
  "data": {
    "player": {
      "gameId": "12345",
      "name": "PlayerName",
      "steamId": "76561198012345678"
    }
  }
}
```

**Response:**
```json
{
  "success": true
}
```

### GET /poll
Poll for pending commands from Takaro (for Lua mod to check).

**Response (no commands):**
```json
{
  "hasCommand": false
}
```

**Response (with command):**
```json
{
  "hasCommand": true,
  "command": {
    "requestId": "uuid",
    "action": "sendMessage",
    "args": { "message": "Hello world" }
  }
}
```

### POST /result
Send command execution result back to Takaro.

**Request:**
```json
{
  "requestId": "uuid",
  "result": {
    "success": true,
    "message": "Command executed"
  }
}
```

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

## Logs

Logs are written to:
- Console output
- `takaro-bridge.log` file

## Next Steps

1. Create UE4SS Lua mod to hook game events
2. Deploy both bridge server and Lua mod to Astroneer server
3. Test connectivity and event flow
