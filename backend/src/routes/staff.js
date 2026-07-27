const express = require('express');
const { body } = require('express-validator');
const {
  assignReport,
  updateStatus,
  addComment,
  getDashboard
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and authorization to all routes
router.use(protect, authorize('staff', 'admin'));

// Validation rules
const statusValidation = [
  body('status')
    .isIn(['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'])
    .withMessage('Please provide a valid status'),
  body('resolutionDetails')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Resolution details cannot exceed 1000 characters'),
  body('estimatedResolutionDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date')
];

const commentValidation = [
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

// Routes
router.get('/dashboard', getDashboard);
router.put('/reports/:id/assign', assignReport);
router.put('/reports/:id/status', statusValidation, updateStatus);
router.post('/reports/:id/comment', commentValidation, addComment);

module.exports = router;