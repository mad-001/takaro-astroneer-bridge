# Release Notes - v1.7.1

## 🐛 Critical Bug Fix: Player Events Not Being Stored

### Problem
Player-connected and player-disconnected events were being sent to Takaro but **NOT being stored** in the database. Astroneer had ZERO player events while Enshrouded had thousands.

### Root Cause
**For GENERIC game servers, Takaro IGNORES manually sent player events.**

Instead, Takaro auto-generates player-connected/player-disconnected events by:
1. Polling the `getPlayers` endpoint regularly
2. Detecting changes in the player list
3. Creating events automatically when players join/leave

The bridge was sending these events manually (which Takaro ignored), while also not being marked as `reachable` so Takaro wasn't polling `getPlayers`.

### The Fix
✅ **Removed manual player event sending** (lines 746-783)
- Manual events were redundant and ignored by Takaro
- Added clear comments explaining why events aren't sent manually
- Player join/leave are still logged for debugging

✅ **Clarified how GENERIC servers work**
- Events are auto-generated from `getPlayers` polling
- Server must be `reachable: true` for polling to work
- `getPlayers` implementation is correct and working

### How Player Events Work Now
1. Astroneer RCON detects player join/leave → Logs to console
2. Takaro polls `getPlayers` every few seconds → Gets current player list
3. Takaro compares lists → Detects changes
4. Takaro creates events → `player-connected` / `player-disconnected`
5. Events stored in database → Visible in Takaro dashboard

### Deployment Instructions
1. Stop the current bridge: `stop.bat`
2. Extract `astroneer-bridge.tar.gz` to replace old files
3. Start the bridge: `start.bat`
4. Wait ~30 seconds for Takaro to mark server as reachable
5. Join the Astroneer server
6. Check Takaro dashboard - player events should now appear!

### Technical Details
**Comparison with other game types:**
- **Enshrouded (GENERIC)**: ✅ 5179 events (all auto-generated)
- **Eco (GENERIC)**: ❌ 0 player events (same issue as Astroneer had)
- **7 Days to Die (SEVENDAYSTODIE)**: ✅ Events work (native integration)

**GENERIC servers rely on polling, not manual event sending.**

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
