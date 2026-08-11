/**
 * Shared SLA time calculation utilities.
 * Ensures consistent time-difference display across all pages.
 */

export interface SlaTimeInfo {
  /** Whether the SLA is breached (either from server flag or computed) */
  isOverdue: boolean;
  /** Total milliseconds difference (positive = time left, negative = overdue) */
  diffMs: number;
  /** Absolute hours component */
  hours: number;
  /** Absolute minutes component (remainder after hours) */
  minutes: number;
  /** Human-readable short label, e.g. "12h 34m left" or "2h 15m overdue" */
  label: string;
  /** Compact label for badges, e.g. "⏱ 12h left" or "⚠ 2h overdue" */
  badge: string;
}

/**
 * Calculate the SLA time difference between now and the expected resolution date.
 * Uses both the server-side `isBreached` flag AND real-time comparison to
 * ensure the UI is accurate even if the cron hasn't run yet.
 *
 * @param expectedResolutionDate - ISO date string or Date of expected resolution
 * @param isBreachedFromServer - The `sla.isBreached` flag from the backend
 * @returns SlaTimeInfo with all computed fields
 */
export function calculateSlaTimeDiff(
  expectedResolutionDate: string | Date,
  isBreachedFromServer: boolean = false
): SlaTimeInfo {
  const now = Date.now();
  const expected = new Date(expectedResolutionDate).getTime();
  const diffMs = expected - now; // positive = time left, negative = overdue

  // Consider breached if EITHER the server says so OR the deadline has passed
  const isOverdue = isBreachedFromServer || diffMs < 0;

  const absDiffMs = Math.abs(diffMs);
  const totalMinutes = Math.floor(absDiffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Full label with hours and minutes
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  const label = isOverdue ? `${timeStr} overdue` : `${timeStr} left`;

  // Compact badge (hours only for small spaces)
  const badgeTimeStr = hours > 0 ? `${hours}h` : `${minutes}m`;
  const badge = isOverdue ? `⚠ ${badgeTimeStr} overdue` : `⏱ ${badgeTimeStr} left`;

  return {
    isOverdue,
    diffMs,
    hours,
    minutes,
    label,
    badge
  };
}
