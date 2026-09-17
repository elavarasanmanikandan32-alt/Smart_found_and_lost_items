const Message = require('../models/Message');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get messages for a specific item request
// @route   GET /api/chat/messages/:itemId
// @access  Private
const getItemMessages = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId).populate('reportedBy', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Security check: only item owner or admin can view this chat
    const isOwner =
      item.reportedBy &&
      (item.reportedBy._id.toString() === req.user._id.toString() ||
        item.reportedBy.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view messages for this item' });
    }

    const messages = await Message.find({ itemId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    // Mark messages as read if recipient is current user
    await Message.updateMany(
      { itemId, recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      item,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message regarding an item (Admin only)
// @route   POST /api/chat/messages
// @access  Private (Admin only)
const sendMessage = async (req, res, next) => {
  try {
    const { itemId, message } = req.body;
    if (!itemId || !message || !message.trim()) {
      return res.status(400).json({ message: 'Item ID and message text are required' });
    }

    // Strictly enforce that only Admin can send messages/notices
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied: Only administrators can post messages or notices to this channel.',
      });
    }

    const item = await Item.findById(itemId).populate('reportedBy', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Admin is sending, recipient is the item reporter
    const recipientId = item.reportedBy?._id || item.reportedBy;

    const newMessage = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      itemId: item._id,
      message: message.trim(),
      isAdmin: true,
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      'sender',
      'name email role'
    );

    // Send a notification to recipient
    if (recipientId && recipientId.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        itemId: item._id,
        title: `💬 Admin Update regarding "${item.title}"`,
        message: `Admin: "${message.trim().substring(0, 100)}${
          message.length > 100 ? '...' : ''
        }"`,
        type: 'chat',
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations grouped by item (for Admin)
// @route   GET /api/chat/conversations
// @access  Private/Admin
const getAdminConversations = async (req, res, next) => {
  try {
    // Find all distinct item IDs that have chat messages
    const distinctItemIds = await Message.distinct('itemId');

    const conversations = await Promise.all(
      distinctItemIds.map(async (itemId) => {
        const item = await Item.findById(itemId).populate('reportedBy', 'name email');
        if (!item) return null;

        const lastMessage = await Message.findOne({ itemId })
          .populate('sender', 'name role')
          .sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          itemId,
          recipient: req.user._id,
          isRead: false,
        });

        return {
          item,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Filter out nulls and sort by latest message
    const validConversations = conversations
      .filter(Boolean)
      .sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0;
        const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0;
        return dateB - dateA;
      });

    res.status(200).json(validConversations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItemMessages,
  sendMessage,
  getAdminConversations,
};
