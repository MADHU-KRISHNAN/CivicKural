const cron = require('node-cron');
const Report = require('../models/Report');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Escalation Cron Service
 * 
 * Runs every 5 minutes to detect SLA breaches on pending reports
 * and auto-escalate priority + notify staff/supervisors.
 */

class EscalationCronService {
  static start() {
    // Run every 5 minutes: '*/5 * * * *'
    cron.schedule('*/5 * * * *', async () => {
      try {
        await EscalationCronService.checkForBreaches();
      } catch (error) {
        logger.error(`Escalation Cron Error: ${error.message}`);
      }
    });

    logger.info('⏰ SLA Escalation Cron started — checking every 5 minutes');
  }

  /**
   * Query for pending reports that have breached their SLA
   * and execute escalation actions.
   */
  static async checkForBreaches() {
    const now = new Date();

    // Find reports where:
    // - Status is NOT resolved/closed/rejected
    // - SLA expectedResolutionDate has passed
    // - Not already marked as breached
    const breachedReports = await Report.find({
      status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
      'sla.expectedResolutionDate': { $lt: now },
      'sla.isBreached': { $ne: true },
      'sla.expectedResolutionDate': { $exists: true }
    })
      .populate('assignedStaffId', 'name email staffId supervisorId staffTier')
      .populate('citizenId', 'name email');

    if (breachedReports.length === 0) {
      return; // No breaches, silent return
    }

    logger.warn(`🚨 SLA BREACH DETECTED: ${breachedReports.length} report(s) have exceeded their SLA deadline`);

    for (const report of breachedReports) {
      try {
        await EscalationCronService.escalateReport(report, now);
      } catch (err) {
        logger.error(`Failed to escalate report ${report.reportId}: ${err.message}`);
      }
    }
  }

  /**
   * Escalate a single breached report:
   * 1. Mark SLA as breached
   * 2. Escalate priority to Critical
   * 3. Increment escalation level
   * 4. Log notifications for staff and supervisor
   */
  static async escalateReport(report, now) {
    const previousPriority = report.priority;
    const previousEscalationLevel = report.sla?.escalationLevel || 0;

    // Update breach fields
    report.sla = report.sla || {};
    report.sla.isBreached = true;
    report.sla.breachedAt = now;
    report.sla.escalationLevel = previousEscalationLevel + 1;

    // Escalate priority to Critical
    report.priority = 'Critical';

    await report.save();

    // Log notification for assigned Field Staff (STAFF_TIER_1)
    const staffName = report.assignedStaffId?.name || 'Unassigned';
    const staffEmail = report.assignedStaffId?.email || 'N/A';
    const reportId = report.reportId || report._id;

    logger.warn(
      `📋 STAFF NOTIFICATION — URGENT: SLA breached for Report #${reportId}. ` +
      `Priority escalated from ${previousPriority} to CRITICAL. ` +
      `Assigned Staff: ${staffName} (${staffEmail})`
    );

    // Log notification for Direct Supervisor (STAFF_TIER_2)
    if (report.assignedStaffId?.supervisorId) {
      try {
        const supervisor = await User.findById(report.assignedStaffId.supervisorId)
          .select('name email staffId');

        if (supervisor) {
          logger.warn(
            `🔔 SUPERVISOR ESCALATION — ALARM: Field Staff "${staffName}" has missed the SLA ` +
            `for Report #${reportId}. Action required. ` +
            `Supervisor: ${supervisor.name} (${supervisor.email})`
          );

          // Link supervisor to the report for tracking
          report.supervisorId = supervisor._id;
          await report.save();
        }
      } catch (err) {
        logger.error(`Could not notify supervisor: ${err.message}`);
      }
    } else if (report.supervisorId) {
      // Supervisor already linked, just log
      try {
        const supervisor = await User.findById(report.supervisorId)
          .select('name email');
        if (supervisor) {
          logger.warn(
            `🔔 SUPERVISOR RE-ESCALATION — Report #${reportId} escalation level: ${report.sla.escalationLevel}. ` +
            `Supervisor: ${supervisor.name} (${supervisor.email})`
          );
        }
      } catch (err) {
        logger.error(`Could not re-notify supervisor: ${err.message}`);
      }
    }

    logger.info(
      `✅ Escalation complete for Report #${reportId}: ` +
      `Priority ${previousPriority} → Critical, ` +
      `Escalation Level ${previousEscalationLevel} → ${report.sla.escalationLevel}`
    );
  }
}

module.exports = EscalationCronService;
