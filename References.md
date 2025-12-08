# Astroneer-Takaro Integration References

## Official Takaro Documentation

### API Documentation
- **Takaro API Reference**: https://api.takaro.io/api.html
  - Complete REST API documentation
  - Event system endpoints
  - Player management
  - Game server integration
  - Module system APIs

### General Documentation
- **Takaro Documentation**: https://docs.takaro.io/
  - Getting started guides
  - Integration tutorials
  - Module development
  - Best practices
  - Architecture overview

## Source Code References

### Takaro Core Repository
- **GitHub**: https://github.com/gettakaro/takaro
  - Event system implementation
  - Connector architecture
  - Module system source
  - API server code
  - Database schemas

### Working Integration Example: Eco
- **Local Path**: `/home/zmedh/Takaro-Porjects/Eco/takaro-eco-integration-github`
- **Windows Path**: `\\wsl.localhost\Ubuntu\home\zmedh\Takaro-Porjects\Eco\takaro-eco-integration-github`
- **Purpose**: Reference implementation showing successful player event handling
- **Key Features**:
  - Native C# plugin running inside game server
  - Direct game event access
  - Real-time player connect/disconnect events
  - Integration with Takaro event system

## Astroneer Integration Project

### Main Repository
- **GitHub**: https://github.com/mad-001/Astroneer-Takaro-Integration
  - Source code for Astroneer bridge
  - Release history (v1.0.0 - current)
  - Issue tracker
  - Pull requests and discussions

### Documentation Site
- **GitHub Pages**: https://mad-001.github.io/takaro-astroneer-bridge/
  - Installation guides
  - Configuration instructions
  - Usage documentation
  - Troubleshooting

## Key Differences: Eco vs Astroneer

### Eco Integration Architecture
- **Type**: Native C# plugin
- **Runs**: Inside game server process
- **Event Access**: Direct game event hooks
- **Event Sending**: Via internal Takaro APIs
- **Connector Type**: Native game integration

### Astroneer Integration Architecture
- **Type**: External bridge application
- **Runs**: Separate process from game server
- **Event Access**: Via RCON polling
- **Event Sending**: WebSocket (limited) + Server-side module
- **Connector Type**: GENERIC WebSocket connector

## Critical Technical Insights

### Event System Limitations
1. **GENERIC connectors cannot send events to Takaro** (protocol limitation)
2. Native game integrations (Eco, 7D2D, Rust) have direct event access
3. External bridges must use alternative approaches (polling, server-side modules)

### Working Solution for Astroneer
- **Method**: Takaro module with cronjob
- **Polling**: Every 60 seconds via `playerOnGameServer` API
- **Detection**: Set comparison for online status changes
- **Event Creation**: `takaro.event.eventControllerCreate()` (server-side)
- **State Storage**: Module variables

## Development Resources

### Tools & Libraries
- Takaro Helpers: `@takaro/helpers` npm package
- Takaro SDK: Available via npm
- WebSocket clients for GENERIC connector protocol
- Node.js for bridge development

### Testing & Debugging
- Takaro API Explorer: https://api.takaro.io/api.html (interactive testing)
- Browser DevTools for WebSocket inspection
- Takaro event logs in dashboard
- Database queries for event verification

## Historical Context

### Problem Evolution (v1.0.0 - v1.10.0)
See `FixingPlayerConnectDisconnect.md` for complete analysis of:
- All attempted solutions
- Why each approach failed
- Evolution of understanding
- Final working implementation

### Key Milestone: v1.10.0
- **Date**: December 7, 2025
- **Breakthrough**: Server-side event generation via module
- **Result**: Fully functional player connect/disconnect events
- **Status**: Production ready

## Related Documentation

### Local Project Files
- `AUTONOMOUS_RESEARCH_PROMPT.md` - Research methodology
- `FixingPlayerConnectDisconnect.md` - Comprehensive analysis report
- Repository README files
- Module configuration examples

## External References

### Game Server Documentation
- Astroneer Dedicated Server documentation
- RCON protocol specifications
- Steam API references (if applicable)

### Development Communities
- Takaro Discord server
- GitHub Discussions on gettakaro/takaro
- Issue trackers for bug reports and feature requests

---

**Last Updated**: December 8, 2025
**Maintained By**: Autonomous Research Agent
**Purpose**: Central reference hub for Astroneer-Takaro integration development
