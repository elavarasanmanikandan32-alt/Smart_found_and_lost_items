const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  updateItemStatus,
  getMyReports,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Item CRUD routes
router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), createItem);

// My reports (MUST be before /:id to prevent route parameter collision)
router.get('/my-reports', protect, getMyReports);

router.route('/:id')
  .get(getItemById)
  .put(protect, upload.single('image'), updateItem)
  .delete(protect, deleteItem);

// Status update
router.patch('/:id/status', protect, updateItemStatus);

module.exports = router;
