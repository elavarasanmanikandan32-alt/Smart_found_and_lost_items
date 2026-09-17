const mongoose = require('mongoose');

/**
 * MongoDB Schema for Chat Messages between User & Admin regarding a Lost/Found request
 */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
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

messageSchema.index({ itemId: 1, createdAt: 1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = {
  messageSchema,
  Message,
};
