# Release Notes - v1.7.2

## 🐛 Critical Bug Fix: Player Events Now Working

### The Problem
Player-connected and player-disconnected events were being **sent to Takaro but NOT stored in the database**. This meant:
- ❌ No player activity history in Takaro dashboard
- ❌ Event-based hooks and modules didn't trigger for player join/leave
- ❌ Player tracking features were completely broken for Astroneer servers

### The Root Cause
Manual player events were sending data with **inconsistent types** compared to what `getPlayers` returns:

**getPlayers returned:**
```json
{
  "gameId": "12345",
  "name": "PlayerName",
  "platformId": "astroneer:12345",
  "steamId": "",
  "ip": "",
  "ping": 0
}
```

**Manual events were sending:**
```json
{
  "gameId": "12345",
  "name": "PlayerName",
  "steamId": null,
  "epicOnlineServicesId": null,
  "xboxLiveId": null,
  "platformId": "astroneer:12345",
  "ip": null,
  "ping": null
}
```

Takaro validates that manual player events match the data structure from `getPlayers`. The **null vs empty string/zero mismatch** was causing Takaro to reject the events silently.

### The Solution
v1.7.2 makes manual player events match the **exact data structure** that `getPlayers` returns:
- ✅ Changed `steamId: null` → `steamId: ''` (empty string)
- ✅ Changed `ip: null` → `ip: ''` (empty string)
- ✅ Changed `ping: null` → `ping: 0` (number zero)
- ✅ Removed `epicOnlineServicesId` and `xboxLiveId` fields (not in getPlayers)
- ✅ Reordered fields to match getPlayers exactly

### What's Fixed
- ✅ **Player-connected events are now stored** when players join the server
- ✅ **Player-disconnected events are now stored** when players leave the server
- ✅ **Player activity tracking works** in Takaro dashboard
- ✅ **Event-based hooks and modules trigger correctly** for player events
- ✅ **Initial player events on bridge startup** send correct format

### Files Changed
**src/index.ts** (lines 760-810):
- Fixed `playerjoin` event handler
- Fixed `playerleft` event handler
- Fixed `newplayer` event handler
- Fixed initial player events on RCON connect

### Installation
1. Download `astroneer-bridge.tar.gz` from this release
2. Extract to your bridge directory
3. Run `npm install` (if not already done)
4. Start with `start.bat`

Your existing `TakaroConfig.txt` will work without changes.

### Verification
After updating, player events should appear in:
- Takaro Dashboard → Events tab
- Filter for event types: `player-connected`, `player-disconnected`
- You should see entries with your Astroneer players' names

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
