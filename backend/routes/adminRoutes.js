const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getAdminStats,
  getAdminItems,
  approveItem,
  rejectItem,
  markReadyForPickup,
  promoteToAdmin,
} = require('../controllers/adminController');

// Quick setup endpoint to promote a user to admin
router.post('/promote', promoteToAdmin);

// Protected Admin Routes
router.use(protect);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/items', getAdminItems);
router.patch('/items/:id/approve', approveItem);
router.patch('/items/:id/reject', rejectItem);
router.patch('/items/:id/pickup-ready', markReadyForPickup);

module.exports = router;
