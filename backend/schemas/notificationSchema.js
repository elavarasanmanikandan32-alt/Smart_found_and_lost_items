const mongoose = require('mongoose');

/**
 * MongoDB Schema for User Notifications
 * Dispatches updates for item approval, rejection, ready-for-pickup alerts, and chat messages.
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['approval', 'rejection', 'pickup', 'claim', 'chat', 'general'],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = {
  notificationSchema,
  Notification,
};
