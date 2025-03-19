const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/validate');
const { APIError } = require('../middleware/errorHandler');
const { uploadSingle, optimizeImage } = require('../middleware/upload');

// @route   GET /api/users
// @desc    Get all users (with pagination and filtering)
// @access  Private/Admin
router.get('/', [auth, checkRole('admin')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', [auth, checkRole('admin')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/users
// @desc    Create a new user (by admin)
// @access  Private/Admin
router.post('/', [
  auth,
  checkRole('admin'),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
  check('firstName', 'First name is required').not().isEmpty(),
  check('lastName', 'Last name is required').not().isEmpty(),
  check('role', 'Role must be admin, teacher, or parent').isIn(['admin', 'teacher', 'parent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, phoneNumber } = req.body;

    // Check if user already exists
    let user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Create new user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber
    });

    // Save user to database
    await user.save();

    res.status(201).json(user.getPublicProfile());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/:id', [
  auth,
  checkRole('admin'),
  check('firstName', 'First name is required').optional().not().isEmpty(),
  check('lastName', 'Last name is required').optional().not().isEmpty(),
  check('email', 'Please include a valid email').optional().isEmail(),
  check('role', 'Role must be admin, teacher, or parent').optional().isIn(['admin', 'teacher', 'parent']),
  check('isActive', 'isActive must be a boolean').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, role, isActive, phoneNumber } = req.body;

    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });
      }
      user.email = email;
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    res.json(user.getPublicProfile());
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', [auth, checkRole('admin')], async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if trying to delete self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }

    // Delete user
    await user.remove();

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/:id/password
// @desc    Reset user password (by admin)
// @access  Private/Admin
router.put('/:id/password', [
  auth,
  checkRole('admin'),
  check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;

    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/:id/profile-image
// @desc    Upload profile image
// @access  Private/Admin
router.put('/:id/profile-image', [
  auth,
  checkRole('admin'),
  uploadSingle('profileImage'),
  optimizeImage()
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update profile image
    user.profileImage = req.fileMetadata;
    await user.save();

    res.json({ msg: 'Profile image updated', profileImage: user.profileImage });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private/Admin
router.get('/stats/overview', [auth, checkRole('admin')], async (req, res) => {
  try {
    // Get counts by role
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get active vs inactive counts
    const statusCounts = await User.aggregate([
      { $group: { _id: '$isActive', count: { $sum: 1 } } }
    ]);

    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUserCount = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Format the results
    const roleStats = {};
    roleCounts.forEach(item => {
      roleStats[item._id] = item.count;
    });

    const statusStats = {
      active: 0,
      inactive: 0
    };
    statusCounts.forEach(item => {
      if (item._id === true) {
        statusStats.active = item.count;
      } else {
        statusStats.inactive = item.count;
      }
    });

    res.json({
      total: roleStats.admin + roleStats.teacher + roleStats.parent || 0,
      byRole: roleStats,
      byStatus: statusStats,
      newUsers: newUserCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 