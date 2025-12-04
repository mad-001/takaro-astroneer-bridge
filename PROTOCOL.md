# Takaro Protocol Documentation

## Player Data Structure

When sending player events to the bridge, use this format:

```json
{
  "gameId": "unique-player-id",
  "name": "PlayerName",
  "platformId": "astroneer:unique-player-id",
  "steamId": "76561198XXXXXXXXX",
  "ip": "192.168.1.100",
  "ping": 45
}
```

### Field Descriptions

- **gameId** (string, required): Unique identifier for the player in the game
- **name** (string, required): Player's display name
- **platformId** (string, required): Platform-specific ID in format `platform:id` (e.g., `astroneer:player123`)
- **steamId** (string, optional): Steam ID if available
- **ip** (string, optional): Player's IP address
- **ping** (number, optional): Player's latency in milliseconds

## Event Types

### player-connected
Sent when a player joins the server.

```json
{
  "type": "player-connected",
  "data": {
    "player": { /* player object */ }
  }
}
```

### player-disconnected
Sent when a player leaves the server.

```json
{
  "type": "player-disconnected",
  "data": {
    "player": { /* player object */ }
  }
}
```

### chat-message
Sent when a player sends a chat message.

```json
{
  "type": "chat-message",
  "data": {
    "player": { /* player object */ },
    "message": "Hello world!",
    "channel": "global",
    "timestamp": 1234567890
  }
}
```

## Command Responses

### testReachability
```json
{
  "connectable": true,
  "reason": null
}
```

### getPlayers
Returns array of player objects:
```json
[
  { /* player object */ },
  { /* player object */ }
]
```

### sendMessage
```json
{
  "success": true
}
```

### executeCommand
```json
{
  "success": true,
  "rawResult": "Command output here"
}
```

### kickPlayer
```json
{
  "success": true
}
```

## Error Responses

All errors should include:
```json
{
  "error": "Error message description"
}
```
