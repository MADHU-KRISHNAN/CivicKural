const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/reportController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload, processImages } = require('../middleware/upload');
const Report = require('../models/Report');

const router = express.Router();

// Validation rules
const createReportValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .optional(),
  body('priority')
    .optional(),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Please provide a valid longitude'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Please provide a valid latitude'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
];

const updateReportValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Priority must be between 1 and 5')
];

const feedbackValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

const submitProofValidation = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const verifyResolutionValidation = [
  body('status')
    .isIn(['Verified', 'Rejected'])
    .withMessage('Status must be Verified or Rejected'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters')
];

// Add new citizen and admin routes
// Get my reports (citizen view)
router.get('/my', protect, async (req, res, next) => {
  try {
    console.log("Fetching reports for citizen ID:", req.user.id);
    const reports = await Report.find({ citizenId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('citizenId', 'name email')
      .populate('assignedStaffId', 'name staffId department');
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error("Error fetching citizen reports:", error);
    next(error);
  }
});

// Get all reports (admin/staff view)
router.get('/admin', protect, async (req, res, next) => {
  try {
    // Check if user is staff
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Staff role required'
      });
    }
    
    console.log("Fetching all reports for staff/admin");
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .populate('citizenId', 'name email')
      .populate('assignedStaffId', 'name staffId department');
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    next(error);
  }
});

// Get nearby reports (public/proximity view)
router.get('/nearby', protect, getNearbyReports);

// Get community issues (public view for citizens)
router.get('/community', protect, async (req, res, next) => {
  try {
    console.log("Fetching community issues for public view");
    const reports = await Report.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .select('title category status priority location.address createdAt updatedAt photos')
      .limit(50); // Limit for performance
    
    // Anonymize the data
    const anonymizedReports = reports.map(report => ({
      id: report._id,
      title: report.title,
      category: report.category,
      status: report.status,
      priority: report.priority,
      location: {
        address: report.location?.address?.replace(/\d+/g, 'XXX') || 'Location withheld', // Anonymize specific addresses
        coordinates: null // Don't show exact coordinates
      },
      photoUrl: report.photos?.[0]?.url,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      citizenId: 'Anonymous' // Don't show who submitted
    }));
    
    res.json({
      success: true,
      count: anonymizedReports.length,
      reports: anonymizedReports
    });
  } catch (error) {
    console.error("Error fetching community issues:", error);
    next(error);
  }
});

// Original routes
router.route('/')
  .get(optionalAuth, getReports)
  .post(protect, upload, processImages, createReportValidation, createReport);

router.route('/:id')
  .get(optionalAuth, getReport)
  .put(protect, updateReportValidation, updateReport)
  .delete(protect, deleteReport);

router.post('/:id/feedback', protect, feedbackValidation, submitFeedback);

router.post('/:id/submit-proof', protect, upload, processImages, submitProofValidation, submitResolutionProof);
router.post('/:id/verify-resolution', protect, verifyResolutionValidation, verifyResolution);
router.post('/:id/upvote', protect, upvoteReport);
router.put('/:id/status', protect, updateReportStatus);

module.exports = router;