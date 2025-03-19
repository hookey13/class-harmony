const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail
} = require('../controllers/parentAuthController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes (require auth)
router.get('/logout', protect, authorize('parent'), logout);
router.get('/me', protect, authorize('parent'), getMe);
router.put('/updatedetails', protect, authorize('parent'), updateDetails);
router.put('/updatepassword', protect, authorize('parent'), updatePassword);

module.exports = router; 