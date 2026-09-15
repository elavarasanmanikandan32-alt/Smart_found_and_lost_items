const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getItemClaims,
  getReceivedClaims,
  updateClaimStatus,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

// Base claim route
router.post('/', protect, createClaim);

// User's own claims
router.get('/my', protect, getMyClaims);

// Incoming claims across all user's found items
router.get('/received', protect, getReceivedClaims);

// Claims on a specific item (for item reporter)
router.get('/item/:itemId', protect, getItemClaims);

// Approve or reject claim
router.patch('/:id', protect, updateClaimStatus);

module.exports = router;
