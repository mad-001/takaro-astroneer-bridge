# Release Notes - v1.11.2

**Release Date:** December 16, 2025

## 🔧 Server Shutdown Enhancement Release

This release adds proper process termination when using Takaro's serverShutdown command, ensuring clean server restarts without orphaned processes.

## What's New

### Enhanced Server Shutdown Handling
- **Automatic Process Termination**: Bridge now forcefully kills Astroneer server processes after serverShutdown
- **20-Second Graceful Period**: Allows server to shutdown cleanly before process termination
- **Automatic RCON Reconnection**: Bridge reconnects to RCON when server restarts
- **No Bridge Downtime**: Bridge stays running throughout the shutdown/restart cycle

## The Problem This Solves

Previously, when using Takaro's `serverShutdown` command:
- Bridge sent `DSServerShutdown` via RCON to Astroneer
- Astroneer server would gracefully shutdown
- **BUT** the Astroneer process remained running
- Server restarts would fail because process wasn't terminated

Now with v1.11.2:
1. Bridge sends `DSServerShutdown` to Astroneer (graceful shutdown)
2. Bridge waits 20 seconds
3. Bridge forcefully kills `AstroServer.exe` and `AstroServer-Win64-Shipping.exe`
4. Bridge disconnects RCON temporarily
5. Bridge waits 5 seconds
6. Bridge reconnects RCON for when server comes back

## Technical Details

### Process Termination
The bridge now executes Windows `taskkill` commands to ensure complete process cleanup:
```
taskkill /F /IM AstroServer.exe /T
taskkill /F /IM AstroServer-Win64-Shipping.exe /T
```

### Workflow
```
Takaro → serverShutdown command
    ↓
Bridge → Executes DSServerShutdown via RCON
    ↓
Bridge → Waits 20 seconds
    ↓
Bridge → Kills Astroneer processes
    ↓
Bridge → Disconnects RCON
    ↓
Bridge → Waits 5 seconds
    ↓
Bridge → Reconnects RCON (ready for restart)
```

## Files Modified
- `src/index.ts` - Added shutdown detection and process termination logic
- `dist/index.js` - Compiled JavaScript with new shutdown handling
- `package.json` - Version bump to 1.11.0

## Who Should Update?

**Highly Recommended** if you:
- Use Takaro to restart your Astroneer server
- Experience issues with orphaned processes after shutdown
- Want reliable server restarts via Takaro commands

## Upgrading from v1.10.x

1. Stop the bridge: Run `stop.bat`
2. Download v1.11.2 and extract
3. Copy your `TakaroConfig.txt` to the new version
4. Start the bridge: Run `start.bat`

Your configuration remains unchanged - this is a drop-in upgrade.

## Breaking Changes

None - fully backward compatible with v1.10.x configurations.

## Known Issues

None reported.

## Quick Links
- 📦 [Download v1.11.2](https://github.com/mad-001/takaro-astroneer-bridge/releases/tag/v1.11.2)
- 📚 [View References](https://github.com/mad-001/takaro-astroneer-bridge/blob/master/References.md)
- 🌐 [Documentation Site](https://mad-001.github.io/takaro-astroneer-bridge/)
- 🔧 [Takaro API](https://api.takaro.io/api.html)
- 📖 [Takaro Docs](https://docs.takaro.io/)

## Previous Release
For information about v1.10.1 (documentation improvements), see [RELEASE_NOTES_v1.10.1.md](./RELEASE_NOTES_v1.10.1.md)

---

**Full Changelog**: https://github.com/mad-001/takaro-astroneer-bridge/compare/v1.10.1...v1.11.2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
