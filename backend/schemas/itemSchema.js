const mongoose = require('mongoose');

/**
 * MongoDB Schema for Lost & Found Items
 * Stores item details and photo data directly in the database.
 */
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an item description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify whether the item is Lost or Found'],
      enum: ['Lost', 'Found'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // Photo stored directly in MongoDB as Base64 Data URL or Image URL
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Claimed', 'Resolved'],
      default: 'Active',
    },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    readyForPickup: {
      type: Boolean,
      default: false,
    },
    pickupLocation: {
      type: String,
      default: '',
    },
    pickupMessage: {
      type: String,
      default: '',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

module.exports = {
  itemSchema,
  Item,
};
