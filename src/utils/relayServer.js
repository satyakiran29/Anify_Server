import { WebSocketServer, WebSocket } from 'ws';

const PING_INTERVAL_MS = 25000;

// Room storage: roomCode -> { host: ws, clients: Set<ws>, pin: string, hostname: string, createdAt: number }
const rooms = new Map();
let wssInstance = null;
let heartbeatInterval = null;

/**
 * Initialize and attach the WebSocket Relay Server to an existing HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {{ wss: WebSocketServer, rooms: Map<string, any> }}
 */
export function initRelayServer(httpServer) {
    if (wssInstance) {
        return { wss: wssInstance, rooms };
    }

    const wss = new WebSocketServer({ server: httpServer });
    wssInstance = wss;

    wss.on('connection', (ws, req) => {
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        let currentRoomCode = null;
        let isHost = false;

        try {
            const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const queryRoom = (url.searchParams.get('room') || '').trim().toUpperCase();
            if (queryRoom) {
                currentRoomCode = queryRoom;
                joinOrCreateRoom(ws, queryRoom);
            }
        } catch (e) { }

        ws.on('message', (data) => {
            try {
                const str = data.toString();
                const msg = JSON.parse(str);

                // 1. Host PC Registration
                if (msg.type === 'REGISTER_HOST') {
                    const rCode = (msg.roomCode || currentRoomCode || '').trim().toUpperCase();
                    if (!rCode) return;

                    currentRoomCode = rCode;
                    isHost = true;

                    let room = rooms.get(rCode) || { host: null, clients: new Set(), pin: msg.pin, hostname: msg.hostname || 'PC', createdAt: Date.now() };
                    room.host = ws;
                    room.pin = msg.pin;
                    room.hostname = msg.hostname || 'PC';
                    rooms.set(rCode, room);

                    console.log(`[${new Date().toLocaleTimeString()}] 💻 Host Registered in Room [${rCode}] (Hostname: ${room.hostname})`);
                    ws.send(JSON.stringify({ type: 'REGISTER_SUCCESS', payload: { roomCode: rCode } }));
                    return;
                }

                // 2. Android Phone Authentication / Join Room
                if (msg.type === 'GLOBAL_AUTH' || msg.type === 'JOIN_ROOM') {
                    const rCode = (msg.roomCode || currentRoomCode || '').trim().toUpperCase();
                    let room = rooms.get(rCode);

                    if (room && room.host && room.host.readyState === WebSocket.OPEN) {
                        currentRoomCode = rCode;
                        isHost = false;
                        room.clients.add(ws);

                        console.log(`[${new Date().toLocaleTimeString()}] 📱 Phone joined Room [${rCode}] -> Forwarding auth to PC`);
                        room.host.send(str); // Forward auth request to PC companion
                    } else {
                        console.log(`[${new Date().toLocaleTimeString()}] ⚠️ Join failed for Room [${rCode}] (Host offline or not found)`);
                        ws.send(JSON.stringify({
                            type: 'AUTH_FAILED',
                            payload: { message: 'PC companion is offline or Room Code is invalid.' }
                        }));
                    }
                    return;
                }

                // 3. Bidirectional Packet Routing between Host and Connected Phones
                let room = rooms.get(currentRoomCode);
                if (!room) return;

                if (ws === room.host) {
                    // From PC (Telemetry/Auth response) -> forward to all paired phone clients
                    for (const client of room.clients) {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(str);
                        }
                    }
                } else {
                    // From Phone (Mouse/Touch/Key/Power actions) -> forward to PC companion
                    if (room.host && room.host.readyState === WebSocket.OPEN) {
                        room.host.send(str);
                    }
                }
            } catch (err) {
                console.error('[Relay Message Error]:', err.message);
            }
        });

        ws.on('close', () => {
            if (currentRoomCode) {
                let room = rooms.get(currentRoomCode);
                if (room) {
                    if (ws === room.host) {
                        console.log(`[${new Date().toLocaleTimeString()}] 🔴 Host disconnected from Room [${currentRoomCode}]`);
                        // Notify clients that host disconnected
                        for (const client of room.clients) {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'HOST_DISCONNECTED', payload: { message: 'PC disconnected.' } }));
                            }
                        }
                        rooms.delete(currentRoomCode);
                    } else {
                        console.log(`[${new Date().toLocaleTimeString()}] 📱 Phone left Room [${currentRoomCode}]`);
                        room.clients.delete(ws);
                    }
                }
            }
        });

        ws.on('error', (err) => {
            console.error('[Relay Socket Error]:', err.message);
        });
    });

    function joinOrCreateRoom(ws, roomCode) {
        let room = rooms.get(roomCode);
        if (!room) {
            room = { host: null, clients: new Set(), pin: null, hostname: 'PC', createdAt: Date.now() };
            rooms.set(roomCode, room);
        }
    }

    // Keepalive Ping/Pong Heartbeat Loop
    heartbeatInterval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) {
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, PING_INTERVAL_MS);

    wss.on('close', () => {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
        wssInstance = null;
    });

    return { wss, rooms };
}

/**
 * Retrieve current metrics and active room count.
 */
export function getRelayStats() {
    return {
        activeRooms: rooms.size,
        totalConnections: wssInstance ? wssInstance.clients.size : 0,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    };
}

/**
 * Close Relay Server (useful for test teardown).
 */
export function closeRelayServer() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
    if (wssInstance) {
        wssInstance.close();
        wssInstance = null;
    }
    rooms.clear();
}
