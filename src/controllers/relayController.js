import { getRelayStats } from '../utils/relayServer.js';

export const relayController = {
  getStats: (req, res) => {
    try {
      const stats = getRelayStats();
      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  getHealth: (req, res) => {
    try {
      const stats = getRelayStats();
      res.status(200).json({
        status: 'online',
        service: 'Anify Cloud Relay Server',
        activeRooms: stats.activeRooms,
        totalConnections: stats.totalConnections,
        uptimeSeconds: stats.uptimeSeconds,
        timestamp: stats.timestamp
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};
