import express from 'express';
import WebSocket from 'ws';
import winston from 'winston';
import dotenv from 'dotenv';
import { client as AstroneerRcon } from 'astroneer-rcon-client';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'takaro-bridge.log' })
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
let takaroWs: WebSocket | null = null;
let isConnectedToTakaro = false;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Astroneer RCON connection
let rconClient: any = null;
let isConnectedToRcon = false;

// Pending requests (for request/response pattern)
const pendingRequests = new Map<string, (response: any) => void>();

// Reconnection state
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 60000; // 60 seconds
const BASE_RECONNECT_DELAY = 3000; // 3 seconds

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
  if (takaroWs && takaroWs.readyState === WebSocket.OPEN) {
    logger.info('Already connected to Takaro');
    return;
  }

  logger.info(`Connecting to Takaro at ${TAKARO_WS_URL} (attempt ${reconnectAttempts + 1})`);
  takaroWs = new WebSocket(TAKARO_WS_URL);

  takaroWs.on('open', () => {
    logger.info('Connected to Takaro WebSocket');
    reconnectAttempts = 0; // Reset on successful connection
    sendIdentify();
  });

  takaroWs.on('message', (data: WebSocket.Data) => {
    try {
      const message = JSON.parse(data.toString());
      handleTakaroMessage(message);
    } catch (error) {
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
  if (!takaroWs || takaroWs.readyState !== WebSocket.OPEN) {
    logger.error('Cannot send identify - not connected');
    return;
  }

  const identifyMessage: any = {
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
function handleTakaroMessage(message: any) {
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

    default:
      logger.warn(`Unknown message type from Takaro: ${message.type}`);
  }
}

/**
 * Handle identify response from Takaro
 */
function handleIdentifyResponse(message: any) {
  if (message.payload?.error) {
    logger.error(`Identification failed: ${message.payload.error}`);
  } else {
    logger.info('Successfully identified with Takaro');
    isConnectedToTakaro = true;
  }
}

/**
 * Handle requests from Takaro (commands to execute in-game)
 */
async function handleTakaroRequest(message: any) {
  const { requestId, payload } = message;
  const { action, args } = payload;

  metrics.requestsReceived++;
  metrics.lastRequestTime = Date.now();

  logger.info(`Takaro request: ${action} (ID: ${requestId})`);

  let responsePayload: any;

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
          responsePayload = players.map((p: any) => ({
            gameId: p.playerGuid,
            name: p.playerName,
            platformId: `astroneer:${p.playerGuid}`,
            steamId: '',
            ip: '',
            ping: 0
          }));
        } catch (error) {
          logger.error(`Failed to get players from RCON: ${error}`);
          responsePayload = [];
        }
      } else {
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
      } else {
        responsePayload = { success: false, error: 'No message provided' };
      }
      break;

    case 'executeCommand':
    case 'executeConsoleCommand':
      // Queue command for Lua mod to execute
      if (args) {
        const cmdArgs = typeof args === 'string' ? JSON.parse(args) : args;
        pendingCommands.push({
          requestId,
          action,
          args: cmdArgs
        });
        logger.info(`Queued ${action} for Lua mod: ${cmdArgs.command || 'unknown'}`);
        // Don't send response yet - wait for Lua to complete it
        return;
      } else {
        responsePayload = { success: false, rawResult: 'No command provided' };
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
          } catch (error) {
            logger.error(`Failed to kick player via RCON: ${error}`);
            responsePayload = { success: false, error: String(error) };
          }
        } else {
          responsePayload = { success: false, error: 'RCON not connected' };
        }
      } else {
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
      } else {
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
      } else {
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
      } else {
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
function handleTakaroResponse(message: any) {
  const { requestId, payload } = message;

  const resolver = pendingRequests.get(requestId);
  if (resolver) {
    resolver(payload);
    pendingRequests.delete(requestId);
  } else {
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
function sendToTakaro(message: any) {
  if (!takaroWs || takaroWs.readyState !== WebSocket.OPEN) {
    logger.error(`Cannot send to Takaro - not connected (state: ${takaroWs?.readyState})`);
    return false;
  }

  try {
    const jsonMessage = JSON.stringify(message);
    takaroWs.send(jsonMessage);

    if (message.type === 'response') {
      metrics.responsesSent++;
    } else if (message.type === 'gameEvent') {
      metrics.eventsSent++;
    }

    logger.info(`Sent to Takaro: ${message.type} ${message.requestId ? '(ID: ' + message.requestId + ')' : ''}`);
    return true;
  } catch (error) {
    metrics.errors++;
    logger.error(`Failed to send message to Takaro: ${error}`);
    return false;
  }
}

/**
 * Send a game event to Takaro
 */
function sendGameEvent(eventType: string, data: any) {
  const message = {
    type: 'gameEvent',
    payload: {
      type: eventType,
      data: data
    }
  };

  logger.info(`Sending game event to Takaro: ${eventType}`);
  sendToTakaro(message);
}

/**
 * Send a response to Takaro request
 */
function sendTakaroResponse(requestId: string, payload: any) {
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
    rconClient = new AstroneerRcon({
      ip: RCON_HOST,
      port: RCON_PORT,
      password: RCON_PASSWORD
    });

    // Connection events
    rconClient.on('connected', () => {
      logger.info('Connected to Astroneer RCON');
      isConnectedToRcon = true;
    });

    rconClient.on('disconnect', () => {
      logger.warn('Disconnected from Astroneer RCON');
      isConnectedToRcon = false;
    });

    rconClient.on('error', (error: Error) => {
      logger.error(`RCON error: ${error.message}`);
      isConnectedToRcon = false;
    });

    // Player events
    rconClient.on('playerjoin', (player: any) => {
      logger.info(`Player joined: ${player.playerName} (${player.playerGuid})`);

      if (isConnectedToTakaro) {
        sendGameEvent('player-connected', {
          player: {
            gameId: player.playerGuid,
            name: player.playerName,
            platformId: `astroneer:${player.playerGuid}`,
            steamId: '', // Not provided by RCON
            ip: ''
          }
        });
      }
    });

    rconClient.on('playerleft', (player: any) => {
      logger.info(`Player left: ${player.playerName} (${player.playerGuid})`);

      if (isConnectedToTakaro) {
        sendGameEvent('player-disconnected', {
          player: {
            gameId: player.playerGuid,
            name: player.playerName,
            platformId: `astroneer:${player.playerGuid}`
          }
        });
      }
    });

    rconClient.on('newplayer', (player: any) => {
      logger.info(`New player detected: ${player.playerName} (${player.playerGuid})`);
    });

    rconClient.on('save', () => {
      logger.info('Game saved');
    });

    // Connect
    rconClient.connect();
  } catch (error) {
    logger.error(`Failed to initialize RCON client: ${error}`);
  }
}

// ========================================
// HTTP API for Lua mod
// ========================================

const app = express();
app.use(express.json());

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
  } else {
    metrics.errors++;
    logger.warn('Not connected to Takaro, event dropped');
    res.status(503).json({ error: 'Not connected to Takaro' });
  }
});

/**
 * Lua mod polls for pending commands/requests from Takaro
 * GET /poll
 */
const pendingCommands: any[] = [];

app.get('/poll', (req, res) => {
  if (pendingCommands.length > 0) {
    const command = pendingCommands.shift();
    res.json({ hasCommand: true, command });
  } else {
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
