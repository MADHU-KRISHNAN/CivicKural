const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Assign report to staff
// @route   PUT /api/staff/reports/:id/assign
// @access  Private (Staff/Admin)
const assignReport = async (req, res, next) => {
  try {
    const { staffId } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Verify staff member exists and has appropriate role
    if (staffId) {
      const staff = await User.findById(staffId);
      if (!staff || staff.role !== 'staff') {
        return res.status(400).json({
          success: false,
          message: 'Invalid staff member'
        });
      }
      report.assignedStaffId = staffId;
    } else {
      // Self-assignment
      report.assignedStaffId = req.user.id;
    }

    await report.save();
    await report.populate('assignedStaffId', 'name staffId department');

    logger.info(`Report ${report.reportId} assigned to staff ${report.assignedStaffId}`);

    res.json({
      success: true,
      message: 'Report assigned successfully',
      report
    });

  } catch (error) {
    logger.error(`Assign report error: ${error.message}`);
    next(error);
  }
};

// @desc    Update report status
// @route   PUT /api/staff/reports/:id/status
// @access  Private (Staff)
const updateStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, resolutionDetails, estimatedResolutionDate } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if staff is assigned to this report or is admin
    if (req.user.role === 'staff' && 
        report.assignedStaffId && 
        report.assignedStaffId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    report.status = status;

    if (resolutionDetails) {
      report.resolutionDetails = resolutionDetails;
    }

    if (estimatedResolutionDate) {
      report.estimatedResolutionDate = new Date(estimatedResolutionDate);
    }

    await report.save();
    await report.populate(['citizenId', 'assignedStaffId']);

    logger.info(`Report ${report.reportId} status updated to ${status} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Report status updated successfully',
      report
    });

  } catch (error) {
    logger.error(`Update status error: ${error.message}`);
    next(error);
  }
};

// @desc    Add staff comment
// @route   POST /api/staff/reports/:id/comment
// @access  Private (Staff)
const addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { comment } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.staffComments.push({
      staffId: req.user.id,
      comment,
      createdAt: new Date()
    });

    await report.save();
    await report.populate('staffComments.staffId', 'name staffId');

    logger.info(`Comment added to report ${report.reportId} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Comment added successfully',
      report
    });

  } catch (error) {
    logger.error(`Add comment error: ${error.message}`);
    next(error);
  }
};

// @desc    Get staff dashboard analytics
// @route   GET /api/staff/dashboard
// @access  Private (Staff)
const getDashboard = async (req, res, next) => {
  try {
    const staffId = req.user.id;

    // Get reports assigned to this staff member
    const assignedReports = await Report.find({ assignedStaffId: staffId })
      .populate('citizenId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get counts by status
    const statusCounts = await Report.aggregate([
      { $match: { assignedStaffId: mongoose.Types.ObjectId(staffId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get recent activity
    const recentActivity = await Report.find({
      $or: [
        { assignedStaffId: staffId },
        { 'staffComments.staffId': staffId }
      ]
    })
    .populate('citizenId', 'name')
    .sort({ updatedAt: -1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        assignedReports,
        statusCounts,
        recentActivity
      }
    });

  } catch (error) {
    logger.error(`Get dashboard error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  assignReport,
  updateStatus,
  addComment,
  getDashboard
};