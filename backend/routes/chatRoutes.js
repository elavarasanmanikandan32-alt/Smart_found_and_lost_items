const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getItemMessages,
  sendMessage,
  getAdminConversations,
} = require('../controllers/chatController');

router.use(protect);

// User & Admin endpoints
router.get('/messages/:itemId', getItemMessages);
router.post('/messages', sendMessage);

// Admin-only conversation list
router.get('/conversations', adminOnly, getAdminConversations);

module.exports = router;
