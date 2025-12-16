# Release Notes - v1.11.3

**Release Date:** December 16, 2025

## 🪟 Window Management Fix

This release fixes the command window behavior when the bridge stops, eliminating confusion about which window is active.

## What's New

### Automatic Window Closing
- **Added `exit` command** to `start.bat`
- Command window now **closes automatically** when bridge stops
- No more orphaned windows with command prompts
- Clear visual indication when bridge is stopped vs running

## The Problem This Solves

Previously, when the bridge stopped (via web manager or manual stop):
- Command window stayed open showing `C:\gameservers\astroneer bridge>`
- Confusing to tell which window had the active bridge
- Had to manually close orphaned windows

Now with v1.11.3:
- Bridge stops → Window closes immediately
- Clean, clear indication of bridge status
- Only running bridge has an open window

## Files Modified
- `start.bat` - Added exit command to close window on stop

## Who Should Update?

**Recommended** if you:
- Use the web server manager to control the bridge
- Frequently stop/start the bridge
- Want cleaner window management

## Upgrading from v1.11.2

1. Stop the bridge: Run `stop.bat` or use web manager
2. Download v1.11.3 and extract
3. Copy your `TakaroConfig.txt` to the new version
4. Start the bridge: Run `start.bat` or use web manager

Your configuration remains unchanged - this is a drop-in upgrade.

## Breaking Changes

None - fully backward compatible with v1.11.x configurations.

## Known Issues

None reported.

## Quick Links
- 📦 [Download v1.11.3](https://github.com/mad-001/takaro-astroneer-bridge/releases/tag/v1.11.3)
- 📚 [View References](https://github.com/mad-001/takaro-astroneer-bridge/blob/master/References.md)
- 🌐 [Documentation Site](https://mad-001.github.io/takaro-astroneer-bridge/)
- 🔧 [Takaro API](https://api.takaro.io/api.html)
- 📖 [Takaro Docs](https://docs.takaro.io/)

## Previous Release
For information about v1.11.2 (server shutdown enhancements), see [RELEASE_NOTES_v1.11.2.md](./RELEASE_NOTES_v1.11.2.md)

---

**Full Changelog**: https://github.com/mad-001/takaro-astroneer-bridge/compare/v1.11.2...v1.11.3

🤖 Generated with [Claude Code](https://claude.com/claude-code)
