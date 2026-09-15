const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public (or Private)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalLost,
      totalFound,
      resolvedClaimed,
      activeReports,
      recentItems,
      totalClaims,
    ] = await Promise.all([
      Item.countDocuments({ type: 'Lost' }),
      Item.countDocuments({ type: 'Found' }),
      Item.countDocuments({ status: { $in: ['Claimed', 'Resolved'] } }),
      Item.countDocuments({ status: 'Active' }),
      Item.find()
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Claim.countDocuments(),
    ]);

    res.status(200).json({
      totalLost,
      totalFound,
      resolvedClaimed,
      activeReports,
      totalClaims,
      recentItems,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
