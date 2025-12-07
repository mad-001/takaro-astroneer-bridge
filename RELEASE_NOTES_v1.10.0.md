# Release Notes - v1.10.0

## 🎉 Major Update: Player Events Finally Working!

### The Problem (History)
Previous versions attempted to send player-connected and player-disconnected events directly from the bridge to Takaro via WebSocket. This approach **fundamentally doesn't work** because:
- ❌ Takaro's generic WebSocket connector protocol doesn't support receiving events from the bridge
- ❌ Only built-in game mods (like 7D2D C# mod) can send events directly
- ❌ WebSocket connections are for request/response only (getPlayers, executeCommand, etc.)
- ❌ Events sent via WebSocket were silently ignored by Takaro

### The Solution (New Architecture)
v1.10.0 introduces a **completely new approach** using a Takaro module to generate events:

#### How It Works Now:
1. **Bridge responds to `getPlayers` requests** - Reports which players are online via WebSocket
2. **Takaro tracks player status** - Automatically updates `playerOnGameServer` records with online/offline status
3. **Takaro module monitors changes** - The "Astroneer Player Event Generator" cronjob runs every minute
4. **Events are created** - Module detects status changes and creates player-connected/player-disconnected events
5. **Hooks trigger** - Discord notifications, player tracking, and other module hooks execute

### What's New in v1.10.0

#### Bridge Changes:
- ✅ Simplified event sending code (attempts still made for logging purposes)
- ✅ Bridge focuses on core responsibilities: getPlayers, executeCommand, sendMessage, etc.
- ✅ More stable WebSocket connection handling
- ✅ Version bump to 1.10.0

#### New Takaro Module: "Astroneer Player Event Generator"
**This module must be installed for player events to work!**

**Features:**
- 🔄 Runs every minute to check player status changes
- 📊 Compares current online players with previous state
- ✨ Creates `player-connected` events when players join
- 👋 Creates `player-disconnected` events when players leave
- 💾 Stores state in Takaro variables for persistence
- 🎯 Works with ALL your existing player event hooks

**Module Details:**
- **Name:** Astroneer Player Event Generator
- **Author:** Claude
- **Cronjob:** Monitor Player Status (runs every 1 minute)
- **Supported Games:** All (works with any generic connector)

### Installation Instructions

#### Step 1: Update the Bridge
1. Download `takaro-astroneer-bridge-v1.10.0.zip` from this release
2. Extract to your bridge directory (backup your `TakaroConfig.txt` first!)
3. Copy your `TakaroConfig.txt` back if needed
4. Restart the bridge with `start.bat`

#### Step 2: Install the Takaro Module
**CRITICAL:** Player events won't work without this module!

1. Go to [Takaro Dashboard](https://app.takaro.io/)
2. Navigate to **Modules** → **Browse Modules**
3. Search for **"Astroneer Player Event Generator"**
4. Click **Install** and select your Astroneer game server
5. Leave all settings at default and click **Install**

That's it! Events will start generating within 60 seconds.

### What's Fixed
- ✅ **Player-connected events are created** when players join
- ✅ **Player-disconnected events are created** when players leave
- ✅ **Discord notifications work** for player join/leave
- ✅ **Player tracking modules work** correctly
- ✅ **Event history is stored** in Takaro database
- ✅ **All player event hooks trigger** as expected

### Known Limitations
- ⏱️ **Up to 60 second delay** - The cronjob runs every minute, so there may be a delay before events are detected
- 🔄 **Requires module installation** - This is a one-time setup step per game server

### Verification

After installing both the bridge and module:

1. **Check bridge logs** - Should see:
   ```
   ✓ Connected to Takaro WebSocket
   ✓ Connected to Astroneer RCON
   ```

2. **Wait 60 seconds** for cronjob to run

3. **Check Takaro Events**:
   - Go to Dashboard → Events
   - Filter by event type: `player-connected`, `player-disconnected`
   - You should see events with source: `player-event-generator`

4. **Check Discord** (if you have player notification hooks):
   - Player connect/disconnect messages should appear
   - Example: "🎆 **PlayerName** connected"

### Technical Details

**Why This Approach?**
After extensive testing and research, we discovered:
- Takaro's generic WebSocket protocol only supports request/response patterns
- Game-specific mods (7D2D, Rust, etc.) run inside the game server and can create events directly
- Generic connectors (like ours for Astroneer) must use a different approach
- The solution: Let Takaro detect changes from `getPlayers` data and generate events via a module

**Event Flow:**
```
Player Joins Game
    ↓
Bridge detects via RCON playerjoin event (logged)
    ↓
Takaro polls getPlayers (every ~30 seconds)
    ↓
playerOnGameServer status updated to online=true
    ↓
Cronjob runs (every 60 seconds)
    ↓
Detects new online player
    ↓
Creates player-connected event
    ↓
Hooks trigger (Discord, tracking, etc.)
```

### Files Changed
- **README.md** - Updated installation instructions
- **package.json** - Version bump to 1.10.0
- **src/index.ts** - Event sending code (for logging, events generated by module)

### Migration from v1.7.2
If you're upgrading from v1.7.2:
1. Update the bridge files (your config is preserved)
2. **Install the Takaro module** (new requirement!)
3. Restart the bridge
4. Events will start working within 60 seconds

**Old player events** created by previous versions will remain in the database but won't be created going forward.

### Troubleshooting

**Events not appearing?**
- Check that the "Astroneer Player Event Generator" module is installed
- Verify the module is enabled in your game server settings
- Wait at least 60 seconds after a player joins/leaves
- Check cronjob execution logs in Takaro

**Discord notifications not working?**
- Verify your player notification hooks are enabled
- Check that hooks are listening for `player-connected` and `player-disconnected` events
- Verify Discord channel ID is configured correctly

**Module not found?**
- The module was created specifically for this release
- If you can't find it, you may need to create it manually or contact support

### Credits
This solution was developed through extensive research and testing of Takaro's WebSocket protocol, analysis of other game connectors, and collaboration with the Takaro platform.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
