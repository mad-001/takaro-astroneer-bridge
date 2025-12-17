"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const winston_1 = __importDefault(require("winston"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// @ts-ignore - No types available for astroneer-rcon-client
const astroneer_rcon_client_1 = require("astroneer-rcon-client");
// Load configuration from TakaroConfig.txt
function loadConfig() {
    const configPath = path.join(process.cwd(), 'TakaroConfig.txt');
    if (!fs.existsSync(configPath)) {
        console.error('ERROR: TakaroConfig.txt not found!');
        console.error('Please edit TakaroConfig.txt with your server settings.');
        process.exit(1);
    }
    const configContent = fs.readFileSync(configPath, 'utf-8');
    configContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            if (key && value) {
                process.env[key.trim()] = value;
            }
        }
    });
}
loadConfig();
// Command help documentation (from Astroneer RCON Research v1.0.0)
// NOTE: Commands are listed WITHOUT "DS" prefix - the bridge adds it automatically
function getCommandHelp() {
    return `
╔═══════════════════════════════════════════════════════════════════════════╗
║                    ASTRONEER RCON COMMAND REFERENCE                       ║
║     NOTE: Type commands WITHOUT "DS" prefix - it's added automatically    ║
╚═══════════════════════════════════════════════════════════════════════════╝

═══ PLAYER MANAGEMENT ═══════════════════════════════════════════════════════

ListPlayers
  Description: List all players with GUIDs, names, and status
  Arguments: None
  Returns: Player info array with GUIDs, categories, names, inGame status
  Sends: DSListPlayers

KickPlayerGuid <playerGuid>
  Description: Kick a player by their GUID
  Arguments: playerGuid (string) - Player's unique GUID
  Returns: Success message with GUID
  Example: KickPlayerGuid 403858294871376674
  Sends: DSKickPlayerGuid 403858294871376674

SetPlayerCategoryForPlayerName "<playerName>" <category>
  Description: Set player role by name (most reliable method)
  Arguments:
    - playerName (string) - Player's display name (use quotes if spaces)
    - category (string) - Owner, Admin, Whitelisted, Unlisted, or Blacklisted
  Returns: Success message with player info
  Example: SetPlayerCategoryForPlayerName "Mad" Admin
  Sends: DSSetPlayerCategoryForPlayerName "Mad" Admin

SetPlayerCategoryGuid <playerGuid> <category>
  Description: Set player role by GUID (may be buggy)
  Arguments:
    - playerGuid (string) - Player's unique GUID
    - category (string) - Owner, Admin, Whitelisted, Unlisted, or Blacklisted
  Returns: Success message
  Note: Use SetPlayerCategoryForPlayerName instead for reliability

═══ SERVER MANAGEMENT ═══════════════════════════════════════════════════════

ServerStatistics
  Description: Get detailed server statistics
  Arguments: None
  Returns: Server info (build, FPS, players, save name, passwords, whitelist)
  Example: ServerStatistics
  Sends: DSServerStatistics

ServerShutdown
  Description: Gracefully shutdown the server
  Arguments: None
  Returns: Confirmation message
  Warning: This will stop the server!

SetPassword <password>
  Description: Set or change server password
  Arguments: password (string) - New password (empty string to remove)
  Returns: Confirmation message
  Example: SetPassword mypassword123
  Sends: DSSetPassword mypassword123

SetDenyUnlisted <true|false>
  Description: Enable or disable whitelist enforcement
  Arguments: boolean - "true" to enable whitelist, "false" to disable
  Returns: Confirmation message
  Example: SetDenyUnlisted true
  Sends: DSSetDenyUnlisted true

═══ SAVE GAME MANAGEMENT ════════════════════════════════════════════════════

ListGames
  Description: List all available save games with metadata
  Arguments: None
  Returns: Active save name and array of available saves
  Example: ListGames
  Sends: DSListGames

SaveGame [saveName]
  Description: Instant save trigger
  Arguments: saveName (string, optional) - Name for new save
  Returns: Confirmation message
  Example: SaveGame MyBackup
  Sends: DSSaveGame MyBackup

LoadGame <saveName>
  Description: Load specified save as active
  Arguments: saveName (string) - Name of save to load
  Returns: Confirmation message
  Example: LoadGame SaveGame$2025.12.04-12.00.00
  Sends: DSLoadGame SaveGame$2025.12.04-12.00.00

NewGame <saveName>
  Description: Create new save (forces player reload)
  Arguments: saveName (string) - Name for new save
  Returns: Confirmation message
  Warning: Forces all players to reload!
  Example: NewGame NewAdventure
  Sends: DSNewGame NewAdventure

RenameGame <oldName> <newName>
  Description: Rename a save file
  Arguments:
    - oldName (string) - Current save name
    - newName (string) - New save name
  Returns: Confirmation message
  Example: RenameGame OldSave NewSave
  Sends: DSRenameGame OldSave NewSave

DeleteGame <saveName>
  Description: Delete a save file
  Arguments: saveName (string) - Name of save to delete
  Returns: Confirmation message
  Warning: This permanently deletes the save!
  Example: DSDeleteGame UnwantedSave

═══ PLAYER CATEGORIES ═══════════════════════════════════════════════════════

Owner        - Full permissions, cannot be changed, always allowed
Admin        - Maximum permissions except ownership, always allowed
Whitelisted  - Standard player, allowed when whitelist is enabled
Unlisted     - No permissions, blocked when whitelist is enabled
Blacklisted  - Banned from server, always blocked

═══ NOTES ═══════════════════════════════════════════════════════════════════

• Player GUIDs are permanent identifiers - use them for reliable operations
• Player names can contain spaces - wrap them in quotes
• Some commands may not work on all server versions
• Always use DSSetPlayerCategoryForPlayerName instead of GUID/Index methods
• Server statistics include: FPS, player count, version, active save
• Creative mode commands are not functional via RCON

═══════════════════════════════════════════════════════════════════════════════

For more information, visit: https://github.com/mad-001/takaro-astroneer-bridge
`;
}
// Configure logger
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: 'takaro-bridge.log' })
    ]
});
// Configuration
const TAKARO_WS_URL = 'wss://connect.takaro.io/';
const IDENTITY_TOKEN = process.env.IDENTITY_TOKEN || '';
const REGISTRATION_TOKEN = process.env.REGISTRATION_TOKEN || '';
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3000', 10);
// RCON Configuration
const RCON_HOST = process.env.RCON_HOST || '127.0.0.1';
const RCON_PORT = parseInt(process.env.RCON_PORT || '5000', 10);
const RCON_PASSWORD = process.env.RCON_PASSWORD || '';
// Takaro WebSocket connection
let takaroWs = null;
let isConnectedToTakaro = false;
let reconnectTimeout = null;
// Astroneer RCON connection
let rconClient = null;
let isConnectedToRcon = false;
let rconReconnectTimeout = null;
// Pending requests (for request/response pattern)
const pendingRequests = new Map();
const requestTimeouts = new Map();
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds
// Reconnection state
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 60000; // 60 seconds
const BASE_RECONNECT_DELAY = 3000; // 3 seconds
let rconReconnectAttempts = 0;
const RCON_RECONNECT_DELAY = 5000; // 5 seconds
// Metrics
const metrics = {
    requestsReceived: 0,
    responsesSent: 0,
    eventsReceived: 0,
    eventsSent: 0,
    errors: 0,
    lastRequestTime: Date.now(),
    startTime: Date.now()
};
/**
 * Connect to Takaro WebSocket server
 */
function connectToTakaro() {
    if (takaroWs && takaroWs.readyState === ws_1.default.OPEN) {
        logger.info('Already connected to Takaro');
        return;
    }
    logger.info(`Connecting to Takaro at ${TAKARO_WS_URL} (attempt ${reconnectAttempts + 1})`);
    takaroWs = new ws_1.default(TAKARO_WS_URL);
    takaroWs.on('open', () => {
        logger.info('Connected to Takaro WebSocket');
        reconnectAttempts = 0; // Reset on successful connection
        sendIdentify();
    });
    takaroWs.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleTakaroMessage(message);
        }
        catch (error) {
            logger.error(`Failed to parse Takaro message: ${error}`);
        }
    });
    takaroWs.on('close', () => {
        logger.warn('Disconnected from Takaro');
        isConnectedToTakaro = false;
        scheduleReconnect();
    });
    takaroWs.on('error', (error) => {
        logger.error(`Takaro WebSocket error: ${error.message}`);
    });
}
/**
 * Send identify message to Takaro
 */
function sendIdentify() {
    if (!takaroWs || takaroWs.readyState !== ws_1.default.OPEN) {
        logger.error('Cannot send identify - not connected');
        return;
    }
    const identifyMessage = {
        type: 'identify',
        payload: {
            identityToken: IDENTITY_TOKEN
        }
    };
    // Add registrationToken only if provided
    if (REGISTRATION_TOKEN) {
        identifyMessage.payload.registrationToken = REGISTRATION_TOKEN;
    }
    logger.info('Sending identify message to Takaro');
    takaroWs.send(JSON.stringify(identifyMessage));
}
/**
 * Handle messages from Takaro
 */
function handleTakaroMessage(message) {
    logger.info(`Received from Takaro: ${message.type}`);
    switch (message.type) {
        case 'identifyResponse':
            handleIdentifyResponse(message);
            break;
        case 'connected':
            logger.info('Takaro confirmed connection');
            break;
        case 'request':
            handleTakaroRequest(message);
            break;
        case 'response':
            handleTakaroResponse(message);
            break;
        case 'ping':
            sendPong();
            break;
        case 'error':
            logger.error(`Takaro error: ${JSON.stringify(message.payload || message)}`);
            break;
        default:
            logger.warn(`Unknown message type from Takaro: ${message.type}`);
    }
}
/**
 * Handle identify response from Takaro
 */
function handleIdentifyResponse(message) {
    if (message.payload?.error) {
        logger.error(`Identification failed: ${message.payload.error}`);
    }
    else {
        logger.info('Successfully identified with Takaro');
        isConnectedToTakaro = true;
    }
}
/**
 * Handle requests from Takaro (commands to execute in-game)
 */
async function handleTakaroRequest(message) {
    const { requestId, payload } = message;
    const { action, args } = payload;
    metrics.requestsReceived++;
    metrics.lastRequestTime = Date.now();
    logger.info(`Takaro request: ${action} (ID: ${requestId})`);
    let responsePayload;
    switch (action) {
        case 'testReachability':
            // Match Eco's response format exactly
            responsePayload = {
                connectable: true,
                reason: null
            };
            break;
        case 'getPlayers':
            // Get player list from RCON
            if (isConnectedToRcon && rconClient) {
                try {
                    const players = await rconClient.listPlayers();
                    // Filter to only return players that are actually in-game (online)
                    const onlinePlayers = players.filter((p) => p.inGame === true);
                    logger.info(`getPlayers: Found ${players.length} total players, ${onlinePlayers.length} online`);
                    if (onlinePlayers.length > 0) {
                        logger.info(`Online players: ${onlinePlayers.map((p) => `${p.name} (${p.guid})`).join(', ')}`);
                    }
                    responsePayload = onlinePlayers.map((p) => ({
                        gameId: String(p.guid),
                        name: String(p.name),
                        platformId: `astroneer:${p.guid}`,
                        steamId: String(p.guid)
                    }));
                }
                catch (error) {
                    logger.error(`Failed to get players from RCON: ${error}`);
                    responsePayload = [];
                }
            }
            else {
                responsePayload = [];
            }
            break;
        case 'sendMessage':
            // Queue command for Lua mod to execute
            if (args) {
                const messageArgs = typeof args === 'string' ? JSON.parse(args) : args;
                pendingCommands.push({
                    requestId,
                    action,
                    args: messageArgs
                });
                logger.info(`Queued sendMessage command for Lua mod`);
                // Don't send response yet - wait for Lua to complete it
                return;
            }
            else {
                responsePayload = { success: false, error: 'No message provided' };
            }
            break;
        case 'executeCommand':
        case 'executeConsoleCommand':
            // Execute RCON command directly
            if (args) {
                const cmdArgs = typeof args === 'string' ? JSON.parse(args) : args;
                const command = cmdArgs.command || '';
                // Special handling for "help" command
                if (command.toLowerCase() === 'help') {
                    responsePayload = {
                        success: true,
                        rawResult: getCommandHelp()
                    };
                    break;
                }
                // Special handling for shutdown commands - respond immediately to avoid timeout
                const isShutdownCommand = command.toLowerCase().includes('servershutdown');
                if (isShutdownCommand && isConnectedToRcon && rconClient) {
                    logger.info('ServerShutdown command detected - responding immediately and executing async');
                    // Send immediate success response to Takaro (don't wait for RCON)
                    responsePayload = {
                        success: true,
                        rawResult: 'Server shutdown initiated'
                    };
                    // Execute shutdown command asynchronously (without blocking)
                    (async () => {
                        try {
                            logger.info(`Executing RCON shutdown command: ${command}`);
                            await rconClient.sendRaw(command).catch(() => {
                                // Ignore errors - server might shut down before responding
                            });
                            // Wait 20 seconds for graceful shutdown, then force kill
                            setTimeout(async () => {
                                logger.info('Forcefully terminating Astroneer server processes...');
                                try {
                                    const { exec } = require('child_process');
                                    const util = require('util');
                                    const execPromise = util.promisify(exec);
                                    // Kill AstroServer.exe and any related processes
                                    await execPromise('taskkill /F /IM AstroServer.exe /T').catch(() => { });
                                    await execPromise('taskkill /F /IM AstroServer-Win64-Shipping.exe /T').catch(() => { });
                                    logger.info('Astroneer server processes terminated');
                                    // Disconnect and reconnect RCON since server is gone
                                    if (rconClient) {
                                        try {
                                            rconClient.disconnect();
                                        }
                                        catch (e) { }
                                    }
                                    isConnectedToRcon = false;
                                    // Schedule RCON reconnection for when server comes back
                                    setTimeout(() => {
                                        logger.info('Attempting to reconnect RCON...');
                                        connectToRcon();
                                    }, 5000);
                                }
                                catch (error) {
                                    logger.error(`Failed to kill Astroneer processes: ${error}`);
                                }
                            }, 20000);
                        }
                        catch (error) {
                            logger.error(`Failed to execute shutdown command: ${error}`);
                        }
                    })();
                    break; // Exit the switch case immediately
                }
                // Execute via RCON (non-shutdown commands)
                if (isConnectedToRcon && rconClient) {
                    try {
                        logger.info(`Executing RCON command: ${command}`);
                        const result = await rconClient.sendRaw(command);
                        responsePayload = {
                            success: true,
                            rawResult: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
                        };
                    }
                    catch (error) {
                        logger.error(`Failed to execute RCON command: ${error}`);
                        responsePayload = {
                            success: false,
                            rawResult: `Error: ${error}`
                        };
                    }
                }
                else {
                    responsePayload = {
                        success: false,
                        rawResult: 'Error: RCON not connected'
                    };
                }
            }
            else {
                responsePayload = {
                    success: false,
                    rawResult: 'Error: No command provided'
                };
            }
            break;
        case 'kickPlayer':
            // Kick player via RCON
            if (args) {
                const kickArgs = typeof args === 'string' ? JSON.parse(args) : args;
                if (isConnectedToRcon && rconClient) {
                    try {
                        await rconClient.kickPlayer(kickArgs.gameId);
                        responsePayload = { success: true };
                    }
                    catch (error) {
                        logger.error(`Failed to kick player via RCON: ${error}`);
                        responsePayload = { success: false, error: String(error) };
                    }
                }
                else {
                    responsePayload = { success: false, error: 'RCON not connected' };
                }
            }
            else {
                responsePayload = { success: false, error: 'No player specified' };
            }
            break;
        case 'banPlayer':
            // Ban player by setting category to Blacklisted using GUID
            if (args) {
                const banArgs = typeof args === 'string' ? JSON.parse(args) : args;
                if (isConnectedToRcon && rconClient) {
                    try {
                        await rconClient.sendRaw(`SetPlayerCategoryGuid ${banArgs.gameId} Blacklisted`);
                        logger.info(`Banned player GUID: ${banArgs.gameId}`);
                        responsePayload = { success: true };
                    }
                    catch (error) {
                        logger.error(`Failed to ban player via RCON: ${error}`);
                        responsePayload = { success: false, error: String(error) };
                    }
                }
                else {
                    responsePayload = { success: false, error: 'RCON not connected' };
                }
            }
            else {
                responsePayload = { success: false, error: 'No player specified' };
            }
            break;
        case 'unbanPlayer':
            // Unban player by setting category back to Unlisted using GUID
            if (args) {
                const unbanArgs = typeof args === 'string' ? JSON.parse(args) : args;
                if (isConnectedToRcon && rconClient) {
                    try {
                        await rconClient.sendRaw(`SetPlayerCategoryGuid ${unbanArgs.gameId} Unlisted`);
                        logger.info(`Unbanned player GUID: ${unbanArgs.gameId}`);
                        responsePayload = { success: true };
                    }
                    catch (error) {
                        logger.error(`Failed to unban player via RCON: ${error}`);
                        responsePayload = { success: false, error: String(error) };
                    }
                }
                else {
                    responsePayload = { success: false, error: 'RCON not connected' };
                }
            }
            else {
                responsePayload = { success: false, error: 'No player specified' };
            }
            break;
        case 'getPlayer':
            // Queue for Lua mod
            if (args) {
                const playerArgs = typeof args === 'string' ? JSON.parse(args) : args;
                pendingCommands.push({
                    requestId,
                    action,
                    args: playerArgs
                });
                return;
            }
            else {
                responsePayload = { error: 'No player specified' };
            }
            break;
        case 'getPlayerInventory':
            // Queue for Lua mod
            if (args) {
                const invArgs = typeof args === 'string' ? JSON.parse(args) : args;
                pendingCommands.push({
                    requestId,
                    action,
                    args: invArgs
                });
                return;
            }
            else {
                responsePayload = [];
            }
            break;
        case 'getPlayerLocation':
            // Queue for Lua mod
            if (args) {
                const locArgs = typeof args === 'string' ? JSON.parse(args) : args;
                pendingCommands.push({
                    requestId,
                    action,
                    args: locArgs
                });
                return;
            }
            else {
                responsePayload = { x: 0, y: 0, z: 0 };
            }
            break;
        case 'listItems':
            // Queue for Lua mod
            pendingCommands.push({
                requestId,
                action,
                args: {}
            });
            return;
        default:
            logger.warn(`Unknown action: ${action}`);
            responsePayload = { error: `Unknown action: ${action}` };
    }
    sendTakaroResponse(requestId, responsePayload);
}
/**
 * Handle responses from Takaro (for our requests)
 */
function handleTakaroResponse(message) {
    const { requestId, payload } = message;
    const resolver = pendingRequests.get(requestId);
    if (resolver) {
        resolver(payload);
        pendingRequests.delete(requestId);
    }
    else {
        logger.warn(`Received response for unknown request: ${requestId}`);
    }
}
/**
 * Send pong response to Takaro ping
 */
function sendPong() {
    sendToTakaro({ type: 'pong' });
}
/**
 * Send a message to Takaro
 */
function sendToTakaro(message) {
    if (!takaroWs || takaroWs.readyState !== ws_1.default.OPEN) {
        logger.error(`Cannot send to Takaro - not connected (state: ${takaroWs?.readyState})`);
        return false;
    }
    try {
        const jsonMessage = JSON.stringify(message);
        takaroWs.send(jsonMessage);
        if (message.type === 'response') {
            metrics.responsesSent++;
        }
        else if (message.type === 'gameEvent') {
            metrics.eventsSent++;
        }
        logger.info(`Sent to Takaro: ${message.type} ${message.requestId ? '(ID: ' + message.requestId + ')' : ''}`);
        return true;
    }
    catch (error) {
        metrics.errors++;
        logger.error(`Failed to send message to Takaro: ${error}`);
        return false;
    }
}
/**
 * Send a game event to Takaro via WebSocket
 * Sends as a request to create an event with player identification data
 */
function sendGameEvent(eventType, data) {
    if (!isConnectedToTakaro) {
        logger.warn(`Cannot send event ${eventType} - not connected to Takaro`);
        return;
    }
    // Log player info if available
    const playerInfo = data.player ? ` (player: ${data.player.name} / ${data.player.gameId})` : '';
    logger.info(`Sending game event via WebSocket: ${eventType}${playerInfo}`);
    // Generate a request ID
    const requestId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Try sending as a 'createEvent' request that Takaro might handle
    const message = {
        type: 'request',
        requestId: requestId,
        payload: {
            action: 'createEvent',
            args: {
                eventName: eventType,
                player: data.player,
                meta: data
            }
        }
    };
    sendToTakaro(message);
}
/**
 * Send a response to Takaro request
 */
function sendTakaroResponse(requestId, payload) {
    const message = {
        type: 'response',
        requestId: requestId,
        payload: payload
    };
    sendToTakaro(message);
}
/**
 * Schedule reconnection to Takaro with exponential backoff
 */
function scheduleReconnect() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
    reconnectAttempts++;
    // Calculate delay with exponential backoff and jitter
    const exponentialDelay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), MAX_RECONNECT_DELAY);
    const jitter = Math.random() * exponentialDelay * 0.25; // 0-25% jitter
    const delayMs = exponentialDelay + jitter;
    logger.info(`Scheduling reconnect attempt ${reconnectAttempts} in ${Math.round(delayMs / 1000)}s`);
    reconnectTimeout = setTimeout(() => {
        logger.info('Attempting to reconnect to Takaro...');
        connectToTakaro();
    }, delayMs);
}
// ========================================
// Astroneer RCON Client
// ========================================
/**
 * Connect to Astroneer RCON server
 */
function connectToRcon() {
    if (!RCON_PASSWORD) {
        logger.warn('RCON_PASSWORD not configured, skipping RCON connection');
        return;
    }
    logger.info(`Connecting to Astroneer RCON at ${RCON_HOST}:${RCON_PORT}`);
    try {
        rconClient = new astroneer_rcon_client_1.client({
            ip: RCON_HOST,
            port: RCON_PORT,
            password: RCON_PASSWORD
        });
        // Connection events
        rconClient.on('connected', async () => {
            logger.info('Connected to Astroneer RCON');
            isConnectedToRcon = true;
            rconReconnectAttempts = 0;
            if (rconReconnectTimeout) {
                clearTimeout(rconReconnectTimeout);
                rconReconnectTimeout = null;
            }
            // Send player-connected events for players who are already online
            // This handles the case where the bridge starts/restarts while players are in-game
            setTimeout(async () => {
                try {
                    const players = await rconClient.listPlayers();
                    if (players && Array.isArray(players)) {
                        for (const player of players) {
                            if (player.inGame && isConnectedToTakaro) {
                                logger.info(`Sending initial player-connected for: ${player.name} (${player.guid})`);
                                sendGameEvent('player-connected', {
                                    player: {
                                        gameId: String(player.guid),
                                        name: String(player.name),
                                        platformId: `astroneer:${player.guid}`,
                                        steamId: String(player.guid)
                                    }
                                });
                            }
                        }
                    }
                }
                catch (error) {
                    logger.error(`Failed to send initial player events: ${error}`);
                }
            }, 3000); // Wait 3 seconds for Takaro connection to be ready
        });
        rconClient.on('disconnect', () => {
            logger.warn('Disconnected from Astroneer RCON');
            isConnectedToRcon = false;
            scheduleRconReconnect();
        });
        rconClient.on('error', (error) => {
            logger.error(`RCON error: ${error.message}`);
            isConnectedToRcon = false;
        });
        // Player events
        rconClient.on('playerjoin', (player) => {
            logger.info(`Player joined: ${player.name} (${player.guid})`);
            if (isConnectedToTakaro) {
                sendGameEvent('player-connected', {
                    player: {
                        gameId: String(player.guid),
                        name: String(player.name),
                        platformId: `astroneer:${player.guid}`,
                        steamId: String(player.guid)
                    }
                });
            }
        });
        rconClient.on('playerleft', (player) => {
            logger.info(`Player left: ${player.name} (${player.guid})`);
            if (isConnectedToTakaro) {
                sendGameEvent('player-disconnected', {
                    player: {
                        gameId: String(player.guid),
                        name: String(player.name),
                        platformId: `astroneer:${player.guid}`,
                        steamId: String(player.guid)
                    }
                });
            }
        });
        rconClient.on('newplayer', (player) => {
            logger.info(`New player detected: ${player.name} (${player.guid})`);
            // New players who are in-game should trigger a join event
            if (player.inGame && isConnectedToTakaro) {
                sendGameEvent('player-connected', {
                    player: {
                        gameId: String(player.guid),
                        name: String(player.name),
                        platformId: `astroneer:${player.guid}`,
                        steamId: String(player.guid)
                    }
                });
            }
        });
        rconClient.on('save', () => {
            logger.info('Game saved');
        });
        // Connect
        rconClient.connect();
    }
    catch (error) {
        logger.error(`Failed to initialize RCON client: ${error}`);
    }
}
/**
 * Schedule RCON reconnection after disconnect
 */
function scheduleRconReconnect() {
    if (rconReconnectTimeout) {
        clearTimeout(rconReconnectTimeout);
    }
    logger.info(`Scheduling RCON reconnection in ${RCON_RECONNECT_DELAY}ms...`);
    rconReconnectTimeout = setTimeout(() => {
        rconReconnectAttempts++;
        logger.info(`Attempting RCON reconnection (attempt ${rconReconnectAttempts})...`);
        connectToRcon();
    }, RCON_RECONNECT_DELAY);
}
// ========================================
// HTTP API for Lua mod
// ========================================
const app = (0, express_1.default)();
app.use(express_1.default.json());
/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    const uptime = Date.now() - metrics.startTime;
    res.json({
        status: 'ok',
        takaroConnected: isConnectedToTakaro,
        rconConnected: isConnectedToRcon,
        uptime: Math.floor(uptime / 1000),
        metrics: {
            requestsReceived: metrics.requestsReceived,
            responsesSent: metrics.responsesSent,
            eventsReceived: metrics.eventsReceived,
            eventsSent: metrics.eventsSent,
            errors: metrics.errors,
            lastRequestTime: metrics.lastRequestTime,
            requestRate: metrics.requestsReceived / (uptime / 1000 / 60) // requests per minute
        }
    });
});
/**
 * Receive game events from Lua mod
 * POST /event
 * Body: { type: "player-connected", data: {...} }
 */
app.post('/event', (req, res) => {
    const { type, data } = req.body;
    if (!type) {
        metrics.errors++;
        return res.status(400).json({ error: 'Missing event type' });
    }
    metrics.eventsReceived++;
    logger.info(`Received event from Lua: ${type}`);
    if (isConnectedToTakaro) {
        sendGameEvent(type, data || {});
        res.json({ success: true });
    }
    else {
        metrics.errors++;
        logger.warn('Not connected to Takaro, event dropped');
        res.status(503).json({ error: 'Not connected to Takaro' });
    }
});
/**
 * Lua mod polls for pending commands/requests from Takaro
 * GET /poll
 */
const pendingCommands = [];
app.get('/poll', (req, res) => {
    if (pendingCommands.length > 0) {
        const command = pendingCommands.shift();
        res.json({ hasCommand: true, command });
    }
    else {
        res.json({ hasCommand: false });
    }
});
/**
 * Lua mod sends command results back
 * POST /result
 */
app.post('/result', (req, res) => {
    const { requestId, result } = req.body;
    if (!requestId) {
        return res.status(400).json({ error: 'Missing requestId' });
    }
    logger.info(`Received command result from Lua: ${requestId}`);
    sendTakaroResponse(requestId, result);
    res.json({ success: true });
});
// Start HTTP server
app.listen(HTTP_PORT, '127.0.0.1', () => {
    logger.info(`HTTP API listening on http://127.0.0.1:${HTTP_PORT}`);
});
// Connect to Takaro
connectToTakaro();
// Connect to Astroneer RCON (if configured)
connectToRcon();
// Handle process termination
process.on('SIGINT', () => {
    logger.info('Shutting down...');
    if (takaroWs) {
        takaroWs.close();
    }
    if (rconClient) {
        rconClient.disconnect();
    }
    process.exit(0);
});
process.on('SIGTERM', () => {
    logger.info('Shutting down...');
    if (takaroWs) {
        takaroWs.close();
    }
    if (rconClient) {
        rconClient.disconnect();
    }
    process.exit(0);
});
//# sourceMappingURL=index.js.map