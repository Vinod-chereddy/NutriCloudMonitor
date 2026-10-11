import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { emitSecurityAlert, emitRiskScoreUpdate, emitActivityLog } from '../utils/socketEmitter.js';

// Sliding window tracker for IP request rate heuristics
const ipRateTracker = new Map();
const RATE_WINDOW_MS = 5000;
const RATE_MAX_REQUESTS = 35;

// Clean up tracker every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRateTracker.entries()) {
    if (now - data.firstSeen > RATE_WINDOW_MS * 2) {
      ipRateTracker.delete(ip);
    }
  }
}, 30000);

// Attack vector patterns
const SQLI_PATTERNS = [
  /(\bunion\b\s+.*\bselect\b)/i,
  /(\bselect\b\s+.*\bfrom\b\s+.*\bwhere\b)/i,
  /(\bdrop\b\s+table\b|\binsert\b\s+into\b|\bupdate\b\s+.*\bset\b)/i,
  /('|\")\s*or\s*('|\")?\d+('|\")?\s*=\s*('|\")?\d+/i,
  /('|\")\s*or\s*('|\")[a-z0-9]+('|\")?\s*=\s*('|\")[a-z0-9]+/i,
  /(\bbenchmark\s*\(|\bsleep\s*\(|\bwaitfor\s+delay\b)/i,
  /(;\s*--|\bexec\s*\(|\bexecute\s*\()/i,
];

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
  /<script\b/i,
  /javascript\s*:\s*[^\s]+/i,
  /onerror\s*=\s*['"][^'"]*['"]/i,
  /onload\s*=\s*['"][^'"]*['"]/i,
  /<img\b[^>]*\bonerror\b/i,
  /<svg\b[^>]*\bonload\b/i,
  /alert\s*\(\s*['"][^'"]*['"]\s*\)/i,
  /document\.cookie/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\/|\.\.\\/i,
  /(etc\/passwd|etc\/shadow|win\.ini|boot\.ini)/i,
];

const NOSQL_INJECTION_PATTERNS = [
  /\$where/i,
  /\$regex.*\$options/i,
];

const SCANNER_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /acunetix/i,
  /masscan/i,
  /nmap/i,
  /w3af/i,
  /zaproxy/i,
];

const checkStringForThreats = (str) => {
  if (typeof str !== 'string') return null;

  for (const pattern of SQLI_PATTERNS) {
    if (pattern.test(str)) {
      return { type: 'SQL_INJECTION_ATTEMPT', risk: 'CRITICAL', pattern: pattern.toString(), match: str.slice(0, 100) };
    }
  }

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(str)) {
      return { type: 'XSS_ATTACK_DETECTED', risk: 'HIGH', pattern: pattern.toString(), match: str.slice(0, 100) };
    }
  }

  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(str)) {
      return { type: 'PATH_TRAVERSAL_ATTEMPT', risk: 'HIGH', pattern: pattern.toString(), match: str.slice(0, 100) };
    }
  }

  for (const pattern of NOSQL_INJECTION_PATTERNS) {
    if (pattern.test(str)) {
      return { type: 'NOSQL_OPERATOR_INJECTION', risk: 'CRITICAL', pattern: pattern.toString(), match: str.slice(0, 100) };
    }
  }

  return null;
};

const recursivelyInspectObject = (obj) => {
  if (!obj || typeof obj !== 'object') return null;

  for (const key of Object.keys(obj)) {
    // Check key for injection
    const keyThreat = checkStringForThreats(key);
    if (keyThreat) return keyThreat;

    const val = obj[key];
    if (typeof val === 'string') {
      const valThreat = checkStringForThreats(val);
      if (valThreat) return valThreat;
    } else if (typeof val === 'object' && val !== null) {
      const nestedThreat = recursivelyInspectObject(val);
      if (nestedThreat) return nestedThreat;
    }
  }
  return null;
};

/**
 * SOC Threat Vector Inspection Middleware
 */
export const socSecurityMonitor = async (req, res, next) => {
  // Ignore static assets or favicon
  if (req.path.startsWith('/images') || req.path.startsWith('/favicon')) {
    return next();
  }

  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Agent';

  // 1. Scanner User-Agent Detection
  for (const pattern of SCANNER_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      const alert = {
        type: 'MALICIOUS_PAYLOAD_DETECTED',
        risk: 'HIGH',
        user: 'Automated Bot Scanner',
        ip: clientIp,
        userAgent,
        description: `Automated vulnerability scanner signature detected: ${userAgent}`,
        details: { path: req.originalUrl, method: req.method },
        mitigationAction: 'REQUEST_DROPPED_AND_LOGGED',
      };
      await emitSecurityAlert(alert);
      return res.status(403).json({
        success: false,
        error: 'SOC_THREAT_BLOCKED',
        message: 'Access blocked by NutriCloud Behavioral SOC: Automated Scanner Signature',
      });
    }
  }

  // 2. IP Rate & Velocity Tracking
  const now = Date.now();
  const rateRecord = ipRateTracker.get(clientIp);
  if (!rateRecord) {
    ipRateTracker.set(clientIp, { count: 1, firstSeen: now });
  } else {
    rateRecord.count += 1;
    if (now - rateRecord.firstSeen <= RATE_WINDOW_MS) {
      if (rateRecord.count > RATE_MAX_REQUESTS) {
        const alert = {
          type: 'RATE_LIMIT_VIOLATION',
          risk: 'HIGH',
          user: 'Rapid Velocity Client',
          ip: clientIp,
          userAgent,
          description: `Exceeded request velocity threshold: ${rateRecord.count} reqs in <5s on ${req.originalUrl}.`,
          details: { requestCount: rateRecord.count, path: req.originalUrl },
          mitigationAction: 'BURST_TRAFFIC_THROTTLED',
        };
        await emitSecurityAlert(alert);
        return res.status(429).json({
          success: false,
          error: 'SOC_RATE_EXCEEDED',
          message: 'NutriCloud SOC Shield: High-velocity request rate throttled.',
        });
      }
    } else {
      // Reset window
      rateRecord.count = 1;
      rateRecord.firstSeen = now;
    }
  }

  // 3. Payload Deep Inspection (URL, Query, Body)
  let threat = checkStringForThreats(req.originalUrl);
  if (!threat && req.query) {
    threat = recursivelyInspectObject(req.query);
  }
  if (!threat && req.body) {
    threat = recursivelyInspectObject(req.body);
  }

  if (threat) {
    // Attempt to extract user info from Authorization header if present
    let identifiedUser = 'Anonymous Visitor';
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'nutricloud_jwt_secret_key_2026_secure';
        const decoded = jwt.decode(token);
        if (decoded?.id || decoded?.userId) {
          userId = decoded.id || decoded.userId;
          const userDoc = await User.findById(userId);
          if (userDoc) {
            identifiedUser = userDoc.email;
            // Elevate user's risk score and system status
            userDoc.riskScore = Math.min(100, (userDoc.riskScore || 0) + 35);
            userDoc.systemStatus = userDoc.riskScore >= 70 ? 'HighRisk' : 'Suspicious';
            await userDoc.save();

            emitRiskScoreUpdate({
              userId: userDoc._id,
              riskScore: userDoc.riskScore,
              systemStatus: userDoc.systemStatus,
              action: threat.type,
            });
          }
        }
      } catch (e) {
        // Token decode notice
      }
    }

    const alertId = `SEC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const description = `Intercepted ${threat.type.replace(/_/g, ' ')} payload targeting [${req.method} ${req.path}]. Threat string signature quarantined.`;

    const alertData = {
      alertId,
      type: threat.type,
      risk: threat.risk,
      user: identifiedUser,
      userId,
      ip: clientIp,
      userAgent,
      description,
      details: {
        method: req.method,
        path: req.originalUrl,
        threatPattern: threat.pattern,
        matchSnippet: threat.match,
      },
      mitigationAction: 'BLOCKED_AT_PERIMETER_GATEWAY',
    };

    // Log Activity
    const actLog = await ActivityLog.create({
      userId,
      action: 'RAPID_REQUESTS',
      details: {
        threatType: threat.type,
        risk: threat.risk,
        interceptedPath: req.originalUrl,
        alertId,
      },
      ipAddress: clientIp,
      userAgent,
    });
    emitActivityLog(actLog);

    // Save and broadcast Security Alert
    await emitSecurityAlert(alertData);

    return res.status(403).json({
      success: false,
      error: 'SOC_THREAT_BLOCKED',
      alertId,
      type: threat.type,
      message: 'NutriCloud Behavioral SOC Gateway intercepted and blocked malicious payload signature.',
    });
  }

  next();
};
