const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getConfiguredAdminCredentials = () => ({
  email: (process.env.ADMIN_EMAIL || 'admin@smartlostfound.com').toLowerCase().trim(),
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
});

const isConfiguredAdminLogin = (email, password) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const { email: configuredEmail, password: configuredPassword } = getConfiguredAdminCredentials();

  return normalizedEmail === configuredEmail && String(password || '') === configuredPassword;
};

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const configuredAdmin = getConfiguredAdminCredentials();
    const role =
      req.body.role === 'admin' ||
      email.toLowerCase().trim() === configuredAdmin.email &&
      password === configuredAdmin.password
        ? 'admin'
        : 'user';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const configuredAdmin = getConfiguredAdminCredentials();
    const normalizedEmail = email.toLowerCase().trim();

    if (isConfiguredAdminLogin(normalizedEmail, password)) {
      let adminUser = await User.findOne({ email: configuredAdmin.email });

      if (!adminUser) {
        adminUser = await User.create({
          name: 'System Administrator',
          email: configuredAdmin.email,
          password: configuredAdmin.password,
          role: 'admin',
        });
      } else {
        adminUser.role = 'admin';
        await adminUser.save();
      }

      return res.status(200).json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
        token: generateToken(adminUser._id),
      });
    }

    // Check for user
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (for debugging)
// @route   GET /api/auth/all-users
// @access  Public
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  getConfiguredAdminCredentials,
  isConfiguredAdminLogin,
};
