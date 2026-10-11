/**
 * Multi-Factor Behavioral Risk Engine & Classification Utility.
 * 
 * Evaluates continuous session risk across 5 telemetry vectors:
 * 1. Authentication failures (brute-force vector)
 * 2. Persistent failure history (credential stuffing vector)
 * 3. Request velocity / Rapid checkouts (bot / card-testing vector)
 * 4. Anomalous navigation flow (clickstream bypass vector)
 * 5. Temporal anomalies (unusual activity hours)
 * 
 * Reversibility Guarantee: Calculates strictly from current metrics, allowing
 * automatic dynamic downgrades (HighRisk -> Safe) once sessions stabilize.
 */
export const calculateRiskScoreAndStatus = (
  failedAttempts = 0,
  totalFailedAttempts = 0,
  options = {}
) => {
  const {
    rapidVelocity = false,
    anomalousTransition = false,
    unusualHour = false,
    rapidBmiAttempts = false,
  } = options;

  let score = 0;
  const triggeredVectors = [];

  // Vector 1: Short-term login failure streak (Weight: 15 per failure)
  if (failedAttempts > 0) {
    const authPenalty = Math.min(60, failedAttempts * 15);
    score += authPenalty;
    triggeredVectors.push(`Failed Logins (+${authPenalty})`);
  }

  // Vector 2: Long-term failed attempts accumulation
  if (totalFailedAttempts > 10) {
    score += 15;
    triggeredVectors.push('Historical Failures > 10 (+15)');
  }

  // Vector 3: Rapid checkout velocity (Bot/Card Testing defense)
  if (rapidVelocity) {
    score += 35;
    triggeredVectors.push('Rapid Checkout Velocity (+35)');
  }

  // Vector 4: Anomalous clickstream transition (Direct bypass to checkout)
  if (anomalousTransition) {
    score += 25;
    triggeredVectors.push('Anomalous Navigation Jump (+25)');
  }

  // Vector 5: Unusual temporal window (e.g. 1:00 AM - 4:30 AM local)
  if (unusualHour) {
    score += 10;
    triggeredVectors.push('Unusual Hour Activity (+10)');
  }

  // Vector 6: Rapid state calculation attempts
  if (rapidBmiAttempts) {
    score += 15;
    triggeredVectors.push('Rapid Telemetry Requests (+15)');
  }

  // Normalize score to maximum of 100
  score = Math.min(100, score);

  // Standard SOC 0-100 Risk Classification
  let systemStatus = 'Safe';
  if (score > 30 && score <= 70) {
    systemStatus = 'Suspicious';
  } else if (score > 70) {
    systemStatus = 'HighRisk';
  }

  return {
    riskScore: score,
    systemStatus,
    triggeredVectors,
  };
};
