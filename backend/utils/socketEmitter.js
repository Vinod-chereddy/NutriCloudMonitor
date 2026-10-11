import { Server } from 'socket.io';

let ioInstance = null;

/**
 * Initialize Socket.io attached to the HTTP server.
 * Handles production and local CORS configurations.
 */
export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin === 'http://localhost:3000' ||
          origin === 'http://localhost:5173' ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive for development/preview
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join admin SOC channel if requested
    socket.on('join_soc_room', () => {
      socket.join('soc_room');
      console.log(`[Socket.io] Socket ${socket.id} joined soc_room`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

/**
 * Retrieve the active Socket.io instance.
 */
export const getIO = () => {
  return ioInstance;
};

import SecurityAlert from '../models/SecurityAlert.js';

/**
 * Broadcast an instant security alert to connected SOC administrators and persist to MongoDB.
 * @param {Object} alert - { id, alertId, type, risk, user, userId, ip, userAgent, description, details, mitigationAction, timestamp }
 */
export const emitSecurityAlert = async (alert) => {
  const alertId = alert.alertId || alert.id || `SEC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  const payload = {
    ...alert,
    id: alertId,
    alertId,
    time: alert.time || 'Just now',
    timestamp: alert.timestamp || new Date().toISOString(),
    status: alert.status || 'ACTIVE',
  };

  // 1. Broadcast over WebSocket to all admin listeners
  if (ioInstance) {
    ioInstance.emit('security_alert', payload);
    console.log(`[Socket.io] 🚨 Emitted security_alert: ${payload.type} for ${payload.user}`);
  }

  // 2. Persist to MongoDB SecurityAlert collection asynchronously
  try {
    await SecurityAlert.create({
      alertId,
      type: alert.type || 'MALICIOUS_PAYLOAD_DETECTED',
      risk: alert.risk || 'HIGH',
      user: alert.user || 'Anonymous Visitor',
      userId: alert.userId || null,
      ip: alert.ip || '127.0.0.1',
      userAgent: alert.userAgent || '',
      description: alert.description || 'Behavioral security vector triggered',
      details: alert.details || {},
      status: alert.status || 'ACTIVE',
      mitigationAction: alert.mitigationAction || 'REQUEST_LOGGED_AND_SCORED',
    });
  } catch (dbErr) {
    console.warn('[SOC Emitter] Notice saving SecurityAlert to DB:', dbErr.message);
  }

  return payload;
};

/**
 * Broadcast a live risk score or system status mutation for a specific user.
 * @param {Object} data - { userId, riskScore, systemStatus, failedAttempts, action }
 */
export const emitRiskScoreUpdate = (data) => {
  if (ioInstance) {
    ioInstance.emit('risk_score_updated', data);
    console.log(`[Socket.io] 📊 Emitted risk_score_updated for user: ${data.userId}`);
  }
};

/**
 * Broadcast an activity log to real-time telemetry subscribers.
 * @param {Object} log - ActivityLog document
 */
export const emitActivityLog = (log) => {
  if (ioInstance) {
    ioInstance.emit('new_activity_log', log);
  }
};
