const Claim = require('../models/Claim');
const Item = require('../models/Item');

// @desc    Submit a claim request for a found item
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res, next) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({ message: 'Please provide itemId and claim message' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only Found items can be claimed
    if (item.type !== 'Found') {
      return res.status(400).json({ message: 'Claims can only be submitted for Found items' });
    }

    // Cannot claim your own reported item
    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot submit a claim for an item you reported yourself' });
    }

    // Prevent duplicate pending claims from the same user for the same item
    const existingClaim = await Claim.findOne({
      itemId,
      claimantId: req.user._id,
      status: 'Pending',
    });

    if (existingClaim) {
      return res.status(400).json({
        message: 'You already have a pending claim for this item. Please wait for the reporter to review it.',
      });
    }

    const claim = await Claim.create({
      itemId,
      claimantId: req.user._id,
      message: message.trim(),
      status: 'Pending',
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate('itemId')
      .populate('claimantId', 'name email');

    res.status(201).json(populatedClaim);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims submitted by the logged-in user
// @route   GET /api/claims/my
// @access  Private
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate({
        path: 'itemId',
        populate: { path: 'reportedBy', select: 'name email' },
      })
      .populate('claimantId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims for a specific item (Owner only)
// @route   GET /api/claims/item/:itemId
// @access  Private
const getItemClaims = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only the item reporter can view claims for this item
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view claims for this item' });
    }

    const claims = await Claim.find({ itemId: item._id })
      .populate('claimantId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all incoming claims across all items reported by current user
// @route   GET /api/claims/received
// @access  Private
const getReceivedClaims = async (req, res, next) => {
  try {
    // Find all items reported by current user
    const userItems = await Item.find({ reportedBy: req.user._id }).select('_id');
    const itemIds = userItems.map((item) => item._id);

    const claims = await Claim.find({ itemId: { $in: itemIds } })
      .populate('itemId')
      .populate('claimantId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject a claim request
// @route   PATCH /api/claims/:id
// @access  Private (Item Reporter only)
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either Approved or Rejected' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    const item = await Item.findById(claim.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Associated item not found' });
    }

    // Authorization: Only the reporter of the item can approve or reject
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage claims for this item' });
    }

    claim.status = status;
    await claim.save();

    // If claim is approved, mark the item status as Claimed
    if (status === 'Approved') {
      item.status = 'Claimed';
      await item.save();

      // Optionally reject other pending claims for this item
      await Claim.updateMany(
        { itemId: item._id, _id: { $ne: claim._id }, status: 'Pending' },
        { status: 'Rejected' }
      );
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate('itemId')
      .populate('claimantId', 'name email');

    res.status(200).json({
      message: `Claim has been ${status.toLowerCase()} successfully`,
      claim: updatedClaim,
      itemStatus: item.status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getItemClaims,
  getReceivedClaims,
  updateClaimStatus,
};
