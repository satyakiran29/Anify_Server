import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import express from 'express';
import { WebSocket } from 'ws';
import { initRelayServer, getRelayStats, closeRelayServer } from '../src/utils/relayServer.js';
import relayRouter from '../src/routes/relayRoutes.js';

let app;
let server;
let port;

test.before(() => {
  return new Promise((resolve) => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/relay', relayRouter);
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'online', relay: getRelayStats() });
    });

    server = http.createServer(app);
    initRelayServer(server);

    server.listen(0, () => {
      port = server.address().port;
      resolve();
    });
  });
});

test.after(() => {
  return new Promise((resolve) => {
    closeRelayServer();
    server.close(() => resolve());
  });
});

test('GET /health and GET /api/v1/relay/stats return relay metrics', async () => {
  const healthRes = await fetch(`http://localhost:${port}/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'online');
  assert.ok(healthData.relay);

  const statsRes = await fetch(`http://localhost:${port}/api/v1/relay/stats`);
  assert.strictEqual(statsRes.status, 200);
  const statsData = await statsRes.json();
  assert.strictEqual(statsData.status, 'success');
  assert.ok(statsData.data.stats);
  assert.strictEqual(typeof statsData.data.stats.activeRooms, 'number');
});

test('Full WebSocket Relay Flow: Host registration, Phone auth, Bidirectional routing, and Disconnect', async () => {
  const roomCode = 'TEST99';
  const pin = '4321';

  // 1. Host Connects and Registers
  const hostWs = new WebSocket(`ws://localhost:${port}/ws?room=${roomCode}`);
  
  await new Promise((resolve, reject) => {
    hostWs.on('open', resolve);
    hostWs.on('error', reject);
  });

  const registerPromise = new Promise((resolve) => {
    hostWs.once('message', (data) => {
      const msg = JSON.parse(data.toString());
      resolve(msg);
    });
  });

  hostWs.send(JSON.stringify({
    type: 'REGISTER_HOST',
    roomCode: roomCode,
    pin: pin,
    hostname: 'Dev-Laptop'
  }));

  const registerResp = await registerPromise;
  assert.strictEqual(registerResp.type, 'REGISTER_SUCCESS');
  assert.strictEqual(registerResp.payload.roomCode, roomCode);

  // Check stats reflect 1 active room
  const stats = getRelayStats();
  assert.strictEqual(stats.activeRooms, 1);

  // 2. Android Phone Connects & sends GLOBAL_AUTH
  const phoneWs = new WebSocket(`ws://localhost:${port}/ws?room=${roomCode}`);
  await new Promise((resolve, reject) => {
    phoneWs.on('open', resolve);
    phoneWs.on('error', reject);
  });

  const hostAuthPromise = new Promise((resolve) => {
    hostWs.once('message', (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });

  phoneWs.send(JSON.stringify({
    type: 'GLOBAL_AUTH',
    roomCode: roomCode,
    pin: pin,
    device: 'Pixel 8'
  }));

  const forwardedAuth = await hostAuthPromise;
  assert.strictEqual(forwardedAuth.type, 'GLOBAL_AUTH');
  assert.strictEqual(forwardedAuth.pin, pin);

  // 3. PC Companion sends AUTH_SUCCESS to Phone
  const phoneAuthSuccessPromise = new Promise((resolve) => {
    phoneWs.once('message', (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });

  hostWs.send(JSON.stringify({
    type: 'AUTH_SUCCESS',
    payload: { message: 'Connected', hostname: 'Dev-Laptop' }
  }));

  const phoneAuthResp = await phoneAuthSuccessPromise;
  assert.strictEqual(phoneAuthResp.type, 'AUTH_SUCCESS');
  assert.strictEqual(phoneAuthResp.payload.hostname, 'Dev-Laptop');

  // 4. Phone sends Mouse Movement to PC
  const mousePacketPromise = new Promise((resolve) => {
    hostWs.once('message', (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });

  phoneWs.send(JSON.stringify({
    type: 'MOUSE_MOVE',
    dx: 15,
    dy: -10
  }));

  const receivedMouse = await mousePacketPromise;
  assert.strictEqual(receivedMouse.type, 'MOUSE_MOVE');
  assert.strictEqual(receivedMouse.dx, 15);
  assert.strictEqual(receivedMouse.dy, -10);

  // 5. Host disconnects -> Phone should receive HOST_DISCONNECTED
  const disconnectPromise = new Promise((resolve) => {
    phoneWs.once('message', (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });

  hostWs.close();
  const discMsg = await disconnectPromise;
  assert.strictEqual(discMsg.type, 'HOST_DISCONNECTED');

  phoneWs.close();
});

test('Phone connecting to offline / non-existent room receives AUTH_FAILED', async () => {
  const badRoomCode = 'NONEXISTENT';
  const phoneWs = new WebSocket(`ws://localhost:${port}/ws?room=${badRoomCode}`);
  
  await new Promise((resolve, reject) => {
    phoneWs.on('open', resolve);
    phoneWs.on('error', reject);
  });

  const authFailPromise = new Promise((resolve) => {
    phoneWs.once('message', (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });

  phoneWs.send(JSON.stringify({
    type: 'GLOBAL_AUTH',
    roomCode: badRoomCode,
    pin: '0000'
  }));

  const failResp = await authFailPromise;
  assert.strictEqual(failResp.type, 'AUTH_FAILED');
  phoneWs.close();
});
