const Notification = require('../models/Notification');

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('itemId', 'title type location')
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
