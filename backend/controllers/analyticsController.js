import mongoose from 'mongoose';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import { emitSecurityAlert, emitActivityLog } from '../utils/socketEmitter.js';

export const trackNavigation = async (req, res) => {
  try {
    const { source, target } = req.body;

    if (!source || !target) {
      return res.status(400).json({ message: 'Source and target are required' });
    }

    // Immediately respond 200 OK so route changes in browser are instantaneous (0ms lag)
    res.status(200).json({ success: true });

    // Asynchronously record navigation if database is reachable
    if (mongoose.connection.readyState === 1) {
      const rawUserId = req.user ? (req.user.userId || req.user.id || req.user._id) : null;
      const userId = rawUserId && mongoose.Types.ObjectId.isValid(rawUserId) ? rawUserId : null;

      // Detect clickstream anomaly: Bypassing catalog and jumping straight to checkout
      const isAnomalousJump = (source === '/' || source === '/login' || source === 'ENTRY' || source === '/home') && target === '/checkout';

      ActivityLog.create({
        userId,
        action: isAnomalousJump ? 'RAPID_REQUESTS' : 'PAGE_TRANSITION',
        details: {
          source,
          target,
          anomalousJump: isAnomalousJump,
          rawUserId: !userId && rawUserId ? String(rawUserId) : undefined
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent']
      }).then((log) => {
        emitActivityLog(log);
        if (isAnomalousJump) {
          emitSecurityAlert({
            type: 'CLICKSTREAM_FLOW_ANOMALY',
            risk: 'HIGH',
            user: rawUserId ? String(rawUserId) : 'Anonymous User',
            ip: req.ip || 'Remote Node',
            description: `Bypassed standard product catalog: Direct jump from '${source}' to '${target}'.`
          });
        }
      }).catch((err) => {
        // Silently capture background telemetry errors without affecting user experience
      });
    }
    return;

    emitActivityLog(log);

    // If an anomalous jump occurs, notify the SOC dashboard in real time
    if (isAnomalousJump) {
      let userIdentifier = 'Anonymous User';
      if (userId) {
        const user = await User.findById(userId);
        if (user) userIdentifier = user.email;
      } else if (rawUserId) {
        userIdentifier = String(rawUserId);
      }

      emitSecurityAlert({
        type: 'CLICKSTREAM_FLOW_ANOMALY',
        risk: 'HIGH',
        user: userIdentifier,
        ip: req.ip || 'Remote Node',
        description: `Bypassed standard product catalog: Direct jump from '${source}' to '${target}'.`
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Clickstream tracking error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
