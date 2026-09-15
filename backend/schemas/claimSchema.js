const mongoose = require('mongoose');

/**
 * MongoDB Schema for Claims
 */
const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide reason/proof for claiming this item'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ itemId: 1, claimantId: 1 });

const Claim = mongoose.models.Claim || mongoose.model('Claim', claimSchema);

module.exports = {
  claimSchema,
  Claim,
};
