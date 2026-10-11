import mongoose from 'mongoose';

const securityAlertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'SQL_INJECTION_ATTEMPT',
        'NOSQL_OPERATOR_INJECTION',
        'XSS_ATTACK_DETECTED',
        'PATH_TRAVERSAL_ATTEMPT',
        'BRUTE_FORCE_ATTACK',
        'MULTIPLE_FAILED_ATTEMPTS',
        'SUSPICIOUS_LOGIN_ATTEMPT',
        'RAPID_CHECKOUT_VELOCITY',
        'CLICKSTREAM_FLOW_ANOMALY',
        'MALICIOUS_PAYLOAD_DETECTED',
        'RATE_LIMIT_VIOLATION',
        'NEW_DEVICE_LOGIN',
        'UNUSUAL_TIME_LOGIN',
        'ANOMALOUS_CART_TAMPERING',
      ],
    },
    risk: {
      type: String,
      enum: ['LOW', 'MED', 'HIGH', 'CRITICAL'],
      default: 'HIGH',
    },
    user: {
      type: String,
      default: 'Anonymous Visitor',
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      default: null,
    },
    ip: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INVESTIGATING', 'RESOLVED'],
      default: 'ACTIVE',
    },
    mitigationAction: {
      type: String,
      default: 'REQUEST_LOGGED_AND_SCORED',
    },
  },
  { timestamps: true }
);

securityAlertSchema.index({ createdAt: -1 });
securityAlertSchema.index({ status: 1 });
securityAlertSchema.index({ risk: 1 });
securityAlertSchema.index({ type: 1 });

export default mongoose.model('SecurityAlert', securityAlertSchema);
