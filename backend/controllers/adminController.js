const Item = require('../models/Item');
const User = require('../models/User');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

// @desc    Get admin statistics overview
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalItems,
      pendingApprovals,
      approvedItems,
      rejectedItems,
      readyForPickupCount,
      pendingClaims,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ approvalStatus: 'Pending' }),
      Item.countDocuments({ approvalStatus: 'Approved' }),
      Item.countDocuments({ approvalStatus: 'Rejected' }),
      Item.countDocuments({ readyForPickup: true }),
      Claim.countDocuments({ status: 'Pending' }),
    ]);

    res.status(200).json({
      totalUsers,
      totalItems,
      pendingApprovals,
      approvedItems,
      rejectedItems,
      readyForPickupCount,
      pendingClaims,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items with full admin details & filters
// @route   GET /api/admin/items
// @access  Private/Admin
const getAdminItems = async (req, res, next) => {
  try {
    const { approvalStatus, type, readyForPickup, search } = req.query;
    const query = {};

    if (approvalStatus && approvalStatus !== 'All') {
      query.approvalStatus = approvalStatus;
    }
    if (type && type !== 'All') {
      query.type = type;
    }
    if (readyForPickup !== undefined && readyForPickup !== 'All') {
      query.readyForPickup = readyForPickup === 'true';
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Item.find(query)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve an item report
// @route   PATCH /api/admin/items/:id/approve
// @access  Private/Admin
const approveItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { adminNotes } = req.body;
    item.approvalStatus = 'Approved';

    // For Lost items, if no custom note provided, default to informing the user
    const defaultApprovalMsg =
      item.type === 'Lost'
        ? 'Your lost item request has been approved. I will inform you if I found it.'
        : `Your reported ${item.type.toLowerCase()} item "${item.title}" has been approved and is now live on the public directory.`;

    const finalNote = adminNotes && adminNotes.trim() ? adminNotes.trim() : defaultApprovalMsg;
    item.adminNotes = finalNote;
    await item.save();

    // Create notification for the user
    await Notification.create({
      recipient: item.reportedBy,
      sender: req.user._id,
      itemId: item._id,
      title: `Report Approved: ${item.title}`,
      message: finalNote,
      type: 'approval',
    });

    // Also record in chat history so user sees it in their Admin Updates channel
    await Message.create({
      sender: req.user._id,
      recipient: item.reportedBy,
      itemId: item._id,
      message: finalNote,
      isAdmin: true,
    });

    const updatedItem = await Item.findById(item._id).populate('reportedBy', 'name email');
    res.status(200).json({
      message: 'Item approved successfully',
      item: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject an item report
// @route   PATCH /api/admin/items/:id/reject
// @access  Private/Admin
const rejectItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { reason } = req.body;
    item.approvalStatus = 'Rejected';
    item.adminNotes = reason ? reason.trim() : 'Does not meet submission guidelines';
    await item.save();

    const rejectMsg = `Your reported ${item.type.toLowerCase()} item "${item.title}" was not approved. Reason: ${
      item.adminNotes
    }`;

    // Create notification for the user
    await Notification.create({
      recipient: item.reportedBy,
      sender: req.user._id,
      itemId: item._id,
      title: `Report Rejected: ${item.title}`,
      message: rejectMsg,
      type: 'rejection',
    });

    // Also record in chat history
    await Message.create({
      sender: req.user._id,
      recipient: item.reportedBy,
      itemId: item._id,
      message: rejectMsg,
      isAdmin: true,
    });

    const updatedItem = await Item.findById(item._id).populate('reportedBy', 'name email');
    res.status(200).json({
      message: 'Item rejected',
      item: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark an item as recovered/found and notify user to come collect it
// @route   PATCH /api/admin/items/:id/pickup-ready
// @access  Private/Admin
const markReadyForPickup = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { location, message } = req.body;
    const pickupLoc = location ? location.trim() : 'Central Lost & Found Desk';
    const customMsg =
      message && message.trim()
        ? message.trim()
        : `Your item "${item.title}" has been found and recovered! Please come and collect it at: ${pickupLoc}.`;

    item.readyForPickup = true;
    item.pickupLocation = pickupLoc;
    item.pickupMessage = customMsg;
    await item.save();

    // Create high-priority pickup notification
    await Notification.create({
      recipient: item.reportedBy._id,
      sender: req.user._id,
      itemId: item._id,
      title: `🎉 Item Ready for Collection: ${item.title}`,
      message: customMsg,
      type: 'pickup',
    });

    // Also record in chat history
    await Message.create({
      sender: req.user._id,
      recipient: item.reportedBy._id,
      itemId: item._id,
      message: customMsg,
      isAdmin: true,
    });

    res.status(200).json({
      message: 'Collection notification dispatched to user successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote or assign admin role to a user (helpful for easy setup/dev)
// @route   POST /api/admin/promote
// @access  Public / Dev
const promoteToAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide user email to promote' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'admin';
    await user.save();

    res.status(200).json({
      message: `User ${user.email} successfully promoted to Admin!`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminItems,
  approveItem,
  rejectItem,
  markReadyForPickup,
  promoteToAdmin,
};
