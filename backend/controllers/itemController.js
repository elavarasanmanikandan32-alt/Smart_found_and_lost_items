const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    Create a new lost or found item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const { title, description, category, type, location, date, status } = req.body;

    if (!title || !description || !category || !type || !location) {
      return res.status(400).json({
        message: 'Please provide title, description, category, type, and location',
      });
    }

    if (!['Lost', 'Found'].includes(type)) {
      return res.status(400).json({ message: 'Type must be Lost or Found' });
    }

    // Determine image source: uploaded file buffer (stored as Base64 in MongoDB) or provided image URL/Base64
    let imagePath = '';
    if (req.file && req.file.buffer) {
      imagePath = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.file && req.file.filename) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    // Auto-approve if submitted by admin, otherwise Pending admin review
    const approvalStatus = req.user && req.user.role === 'admin' ? 'Approved' : 'Pending';

    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      type,
      location: location.trim(),
      date: date ? new Date(date) : new Date(),
      image: imagePath,
      status: status && ['Active', 'Claimed', 'Resolved'].includes(status) ? status : 'Active',
      approvalStatus,
      reportedBy: req.user._id,
    });

    const populatedItem = await Item.findById(item._id).populate('reportedBy', 'name email');

    res.status(201).json(populatedItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items with search and filters
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const { search, type, category, location, status } = req.query;

    const query = {};

    // Keyword search matching title, description, or location
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    // Filter by type (Lost / Found)
    if (type && type !== 'All') {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by location
    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Filter by status (Active / Claimed / Resolved)
    if (status && status !== 'All') {
      query.status = status;
    }

    const items = await Item.find(query)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Owner only)
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Ensure user is the owner
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const { title, description, category, type, location, date, status } = req.body;

    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category.trim();
    if (type && ['Lost', 'Found'].includes(type)) item.type = type;
    if (location) item.location = location.trim();
    if (date) item.date = new Date(date);
    if (status && ['Active', 'Claimed', 'Resolved'].includes(status)) item.status = status;

    if (req.file && req.file.buffer) {
      item.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.file && req.file.filename) {
      item.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      item.image = req.body.image;
    }

    const updatedItem = await item.save();
    const populated = await Item.findById(updatedItem._id).populate('reportedBy', 'name email');

    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Owner only)
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Ensure user is the owner
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // Delete associated claims
    await Claim.deleteMany({ itemId: item._id });

    // Delete item
    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Item and associated claims deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item status (Active, Claimed, Resolved)
// @route   PATCH /api/items/:id/status
// @access  Private (Owner only)
const updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Claimed', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Allowed: Active, Claimed, Resolved' });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item status' });
    }

    item.status = status;
    await item.save();

    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// @desc    Get items reported by current logged-in user
// @route   GET /api/items/my-reports
// @access  Private
const getMyReports = async (req, res, next) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  updateItemStatus,
  getMyReports,
};
