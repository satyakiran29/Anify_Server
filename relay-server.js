/**
 * Anify Connect - Standalone Cloud Relay Server
 * 
 * Facilitates zero-latency communication between Anify Android app and PC Companion
 * across cellular (4G/5G), NATs, and firewalls.
 *
 * Usage:
 *   node relay-server.js
 *   (or: npm run relay)
 */

import http from 'http';
import { initRelayServer, getRelayStats } from './src/utils/relayServer.js';

const PORT = process.env.RELAY_PORT || process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    // Health Check & Stats Endpoint
    if (req.url === '/health' || req.url === '/' || req.url === '/stats') {
        const stats = getRelayStats();
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            status: 'online',
            service: 'Anify Cloud Relay Server',
            ...stats
        }));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

initRelayServer(server);

server.listen(PORT, () => {
    console.log('========================================================');
    console.log('       ✨ ANIFY CLOUD RELAY SERVER IS ONLINE ✨         ');
    console.log('========================================================');
    console.log(` 🌐 HTTP & WebSocket Server running on port ${PORT}`);
    console.log(` 🚀 Ready to route remote control packets globally`);
    console.log('========================================================\n');
});
