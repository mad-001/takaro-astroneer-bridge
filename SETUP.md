# Takaro Astroneer Bridge - Setup Instructions

## Step 1: Get Registration Token from Takaro

You need a registration token from your Takaro dashboard:

1. Go to https://takaro.io and log in
2. Navigate to Game Servers
3. Click "Add Server"
4. Choose type: **GENERIC**
5. Enter a name for your server (e.g., "My Astroneer Server")
6. Copy the **registration token** shown (you'll need this for the .env file)

## Step 2: Configure the Bridge Server

1. **Copy the template file**:
   ```bash
   cp .env.template .env
   ```

2. **Edit `.env` file**:
   ```bash
   nano .env   # or use your preferred editor
   ```

3. **Fill in your values**:
   ```env
   # Your server name (what you named it in Takaro)
   IDENTITY_TOKEN=My Astroneer Server

   # The registration token from Step 1
   REGISTRATION_TOKEN=paste-your-token-here

   # Keep these defaults unless you have a reason to change them
   TAKARO_WS_URL=wss://connect.takaro.io/
   HTTP_PORT=3000
   ```

   **Important**:
   - `IDENTITY_TOKEN` = Your server name
   - `REGISTRATION_TOKEN` = The token from Takaro dashboard (REQUIRED)

## Step 3: Install and Build

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the TypeScript**:
   ```bash
   npm run build
   ```

3. **Test locally** (optional):
   ```bash
   npm start
   ```

   Check the logs - you should see:
   ```
   [INFO] Connecting to Takaro at wss://connect.takaro.io/
   [INFO] HTTP API listening on http://127.0.0.1:3000
   [INFO] Successfully identified with Takaro
   ```

## Step 4: Deploy to Server

Copy these files/folders to your Astroneer server at `C:\GameServers\astroneer\takaro-bridge\`:
- `dist/` folder
- `node_modules/` folder
- `package.json`
- `.env` file (with your configuration!)

## Step 5: Start the Bridge

### Quick Test:
```powershell
cd C:\GameServers\astroneer\takaro-bridge
node dist/index.js
```

### As a Windows Service (Recommended):
See `DEPLOYMENT_GUIDE.md` for instructions on setting up with NSSM or Task Scheduler.

## Troubleshooting

### "Cannot identify with Takaro"
- Check that `IDENTITY_TOKEN` in `.env` matches what you set in Takaro
- Verify you created the game server in Takaro first

### "Connection refused"
- Check that `TAKARO_WS_URL` is correct (should be `wss://connect.takaro.io/`)
- Check your firewall isn't blocking outbound WebSocket connections

### "Port 3000 already in use"
- Change `HTTP_PORT` in `.env` to a different port
- Update the Lua mod configuration to match

## How Registration Works

1. **You add a server in Takaro dashboard** and get a registration token
2. **You configure .env** with:
   - `IDENTITY_TOKEN` = Your server name (what you called it in Takaro)
   - `REGISTRATION_TOKEN` = The token from Takaro
3. **Bridge connects to Takaro** sending both the identity and registration token
4. **Takaro verifies** the registration token and registers your server
5. **Events flow** between your server and Takaro

The registration token is like a one-time password that proves you own this server registration in Takaro.

## Next Steps

Once the bridge is running and connected:
1. Deploy the Lua mod to your Astroneer server
2. Restart Astroneer to load the mod
3. Test event flow from game → bridge → Takaro
