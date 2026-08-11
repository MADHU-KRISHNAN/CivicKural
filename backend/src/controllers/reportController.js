const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');
const logger = require('../config/logger');
const { deleteFile } = require('../middleware/upload');
const aiPipeline = require('../services/aiPipeline');
const AiCategorizationService = require('../services/AiCategorizationService');
const ReportService = require('../services/ReportService');

// @desc    Create new report
// @route   POST /api/reports
// @access  Private (Citizens)
const createReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, category: inputCategory, priority: inputPriority, longitude, latitude, address, audioTranscript } = req.body;

    // AI Categorization step via DistilBERT NLP classifier
    const nlpResult = AiCategorizationService.classifyIssue({ title, description, audioTranscript });
    const finalCategory = inputCategory || nlpResult.predictedCategory;
    const finalPriority = inputPriority || nlpResult.priority;

    // Delegate to the new ReportService which handles Trust Score and AI Pipeline + Clustering
    const reportData = {
      title,
      description,
      category: finalCategory,
      priority: finalPriority,
      audioTranscript,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
        address
      },
      photos: req.processedFiles || [],
      // Initial defaults from NLP
      tier1: nlpResult.tier1,
      tier2: nlpResult.tier2,
      tier3: nlpResult.tier3,
      priorityScore: nlpResult.priorityScore,
      // Mock flags for testing if passed by frontend
      mockAiGenerated: req.body.mockAiGenerated === 'true' || req.body.mockAiGenerated === true,
      mockStockPhoto: req.body.mockStockPhoto === 'true' || req.body.mockStockPhoto === true,
      mockImageToTextMatch: req.body.mockImageToTextMatch === 'true' || req.body.mockImageToTextMatch === true
    };

    const serviceResult = await ReportService.processReportSubmission(reportData, req.user);

    logger.info(`Report submission processed for ${req.user.email}. Merged: ${serviceResult.isMerged}`);

    res.status(201).json({
      success: true,
      message: serviceResult.message,
      report: serviceResult.report,
      isMerged: serviceResult.isMerged
    });

  } catch (error) {
    // Clean up uploaded files if report creation failed
    if (req.processedFiles) {
      req.processedFiles.forEach(file => {
        deleteFile(file.filename);
      });
    }

    logger.error(`Create report error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all reports with filters
// @route   GET /api/reports
// @access  Public/Private
const getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Priority filter
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Location-based filter (within radius)
    if (req.query.longitude && req.query.latitude && req.query.radius) {
      const longitude = parseFloat(req.query.longitude);
      const latitude = parseFloat(req.query.latitude);
      const radius = parseInt(req.query.radius); // in meters

      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius
        }
      };
    }

    // Strict RBAC Data Segregation
    if (req.user) {
      if (req.user.role === 'citizen') {
        // Citizens ONLY see their own reports.
        filter.citizenId = req.user.id;
      } else if (req.user.role === 'staff') {
        // Staff ONLY see reports assigned to them or their department queue
        filter.$or = [
          { assignedStaffId: req.user.id },
          { tier2: req.user.department, assignedStaffId: null }
        ];
      } else if (req.user.role === 'admin') {
        // Admin sees all (filter remains empty unless specified by other queries)
      }
    } else {
      // Public access
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Sort options
    let sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort = { priorityScore: -1, createdAt: -1 }; // Default sort by highest priority score first
    }

    // Execute query
    const reports = await Report.find(filter)
      .populate('citizenId', 'name email')
      .populate('assignedStaffId', 'name staffId department')
      .populate('staffComments.staffId', 'name staffId')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      count: reports.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      reports
    });

  } catch (error) {
    logger.error(`Get reports error: ${error.message}`);
    next(error);
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Public/Private
const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('citizenId', 'name email')
      .populate('assignedStaffId', 'name staffId department')
      .populate('staffComments.staffId', 'name staffId');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check access permissions
    if (!report.isPublic) {
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (req.user.role === 'citizen' && report.citizenId._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    logger.error(`Get report error: ${error.message}`);
    next(error);
  }
};

// @desc    Update report (for citizens - limited fields)
// @route   PUT /api/reports/:id
// @access  Private (Citizens - own reports only)
const updateReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns this report
    if (report.citizenId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    // Citizens can only update if status is 'Submitted'
    if (report.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update report that is already being processed'
      });
    }

    // Only allow certain fields to be updated by citizens
    const allowedUpdates = ['title', 'description', 'priority'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    report = await Report.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('citizenId', 'name email');

    logger.info(`Report updated by citizen: ${report.reportId}`);

    res.json({
      success: true,
      message: 'Report updated successfully',
      report
    });

  } catch (error) {
    logger.error(`Update report error: ${error.message}`);
    next(error);
  }
};

// @desc    Update report status (Admin Override)
// @route   PUT /api/reports/:id/status
// @access  Private (Admin only)
const updateReportStatus = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const { status, notes, department, priority } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required for status override' });
    }

    let report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status) report.status = status;
    if (notes) {
      report.adminNotes = notes;
      report.resolutionDetails = notes;
    }
    if (department) {
      report.tier2 = department;
    }
    if (priority) report.priority = priority;
    
    if (status === 'Resolved' && !report.resolvedAt) {
      report.resolvedAt = new Date();
      report.actualResolutionDate = new Date();
    }

    await report.save();
    
    // Repopulate for frontend
    const updatedReport = await Report.findById(reportId)
      .populate('citizenId', 'name email')
      .populate('assignedStaffId', 'name staffId department');

    logger.info(`Report status overridden by Admin: ${report.reportId}`);

    res.json({
      success: true,
      message: 'Report status updated successfully',
      report: updatedReport
    });
  } catch (error) {
    logger.error(`Update report status error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Citizens - own reports only, Staff - any report)
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions
    if (req.user.role === 'citizen' && report.citizenId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    // Citizens can only delete if status is 'Submitted'
    if (req.user.role === 'citizen' && report.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete report that is already being processed'
      });
    }

    // Delete associated photos
    if (report.photos && report.photos.length > 0) {
      report.photos.forEach(photo => {
        deleteFile(photo.filename);
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    logger.info(`Report deleted: ${report.reportId} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    logger.error(`Delete report error: ${error.message}`);
    next(error);
  }
};

// @desc    Submit citizen feedback
// @route   POST /api/reports/:id/feedback
// @access  Private (Citizens - own reports only)
const submitFeedback = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns this report
    if (report.citizenId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to provide feedback on this report'
      });
    }

    // Can only provide feedback on resolved reports
    if (report.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be provided on resolved reports'
      });
    }

    report.citizenFeedback = {
      rating: parseInt(rating),
      comment,
      submittedAt: new Date()
    };

    await report.save();

    logger.info(`Feedback submitted for report: ${report.reportId}`);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      report
    });

  } catch (error) {
    logger.error(`Submit feedback error: ${error.message}`);
    next(error);
  }
};

// @desc    Submit proof of resolution
// @route   POST /api/reports/:id/submit-proof
// @access  Private (Staff - assigned only)
const submitResolutionProof = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { notes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Only staff assigned to the report can submit proof
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only staff can submit resolution proof' });
    }
    
    if (report.assignedStaffId && report.assignedStaffId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized to submit proof for this report' });
    }

    if (report.status !== 'In Progress' && report.status !== 'Assigned') {
      return res.status(400).json({ success: false, message: 'Can only submit proof for active reports' });
    }

    let photoUrl = '';
    if (req.processedFiles && req.processedFiles.length > 0) {
      photoUrl = req.processedFiles[0].url;
    }

    report.status = 'Pending Verification';
    report.resolutionProof = {
      photoUrl,
      notes,
      submittedAt: new Date(),
      submittedBy: req.user.id
    };

    await report.save();
    logger.info(`Resolution proof submitted for report: ${report.reportId}`);

    res.json({
      success: true,
      message: 'Resolution proof submitted successfully. Pending verification.',
      report
    });
  } catch (error) {
    if (req.processedFiles) {
      req.processedFiles.forEach(file => deleteFile(file.filename));
    }
    logger.error(`Submit proof error: ${error.message}`);
    next(error);
  }
};

// @desc    Verify report resolution
// @route   POST /api/reports/:id/verify-resolution
// @access  Private (Admin or Citizen who reported)
const verifyResolution = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, comments } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Only Admin or original Citizen can verify
    const isAdmin = req.user.role === 'admin';
    const isOwner = report.citizenId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to verify this report' });
    }

    if (report.status !== 'Pending Verification') {
      return res.status(400).json({ success: false, message: 'Report is not pending verification' });
    }

    report.verificationDetails = {
      verifiedAt: new Date(),
      verifiedBy: req.user.id,
      status, // 'Verified' or 'Rejected'
      comments
    };

    if (status === 'Verified') {
      report.status = 'Resolved';
      report.resolvedAt = new Date();
      report.actualResolutionDate = new Date();
      report.resolutionDetails = report.resolutionProof?.notes || 'Resolved and verified';
    } else {
      report.status = 'In Progress'; // Send back to staff
    }

    await report.save();
    logger.info(`Resolution verified (${status}) for report: ${report.reportId}`);

    res.json({
      success: true,
      message: `Report resolution ${status.toLowerCase()} successfully`,
      report
    });
  } catch (error) {
    logger.error(`Verify resolution error: ${error.message}`);
    next(error);
  }
};

// @desc    Get nearby community issues
// @route   GET /api/reports/nearby
// @access  Private
const getNearbyReports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    let longitude = parseFloat(req.query.lng);
    let latitude = parseFloat(req.query.lat);
    let radiusKm = parseFloat(req.query.radiusKm);

    if (isNaN(longitude) || isNaN(latitude)) {
      if (user.permanentAddress && user.permanentAddress.coordinates) {
        longitude = user.permanentAddress.coordinates[0];
        latitude = user.permanentAddress.coordinates[1];
      } else {
        return res.status(400).json({ success: false, message: 'Location parameters missing and no permanent address found.' });
      }
    }

    if (isNaN(radiusKm)) {
      radiusKm = user.feedRadiusKm || 3;
    }

    const radiusMeters = radiusKm * 1000;

    const reports = await Report.find({
      isPublic: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusMeters
        }
      }
    }).sort({ createdAt: -1 }).limit(50);

    // Anonymize the data to some extent for public view
    const anonymizedReports = reports.map(report => ({
      id: report._id,
      title: report.title,
      description: report.description, // Added description for the card view
      category: report.category,
      status: report.status,
      priority: report.priority,
      location: {
        address: report.location?.address?.replace(/\d+/g, 'XXX') || 'Location withheld',
        coordinates: null
      },
      photoUrl: report.photos?.[0]?.url,
      photos: report.photos,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      citizenId: 'Anonymous',
      upvotes: report.upvotes,
      upvotedBy: report.upvotedBy,
      assignedDepartment: report.tier2,
      resolutionDetails: report.resolutionDetails
    }));
    
    res.json({
      success: true,
      count: anonymizedReports.length,
      reports: anonymizedReports
    });

  } catch (error) {
    logger.error(`Get nearby reports error: ${error.message}`);
    next(error);
  }
};

// @desc    Upvote a report
// @route   POST /api/reports/:id/upvote
// @access  Private (Citizens)
const upvoteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (req.user.role !== 'citizen') {
      return res.status(403).json({ success: false, message: 'Only citizens can upvote' });
    }

    const userIdStr = req.user.id.toString();
    const upvotedIndex = report.upvotedBy.findIndex(id => id.toString() === userIdStr);

    let hasUpvoted = false;

    if (upvotedIndex > -1) {
      // User already upvoted, remove upvote
      report.upvotedBy.splice(upvotedIndex, 1);
      report.upvotes = Math.max(0, report.upvotes - 1);
      hasUpvoted = false;
    } else {
      // Add upvote
      report.upvotedBy.push(req.user.id);
      report.upvotes += 1;
      hasUpvoted = true;
    }

    // Trust Score Boost integration
    if (report.upvotedBy.length > 5) {
      report.trustScore = Math.min(1.0, report.trustScore + 0.05);
    }

    await report.save();

    res.json({
      success: true,
      message: hasUpvoted ? 'Upvote added' : 'Upvote removed',
      report: {
        id: report._id,
        upvotes: report.upvotes,
        upvotedBy: report.upvotedBy,
        trustScore: report.trustScore
      }
    });

  } catch (error) {
    logger.error(`Upvote error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  getReport,
  updateReport,
  deleteReport,
  submitFeedback,
  submitResolutionProof,
  verifyResolution,
  updateReportStatus,
  getNearbyReports,
  upvoteReport
};