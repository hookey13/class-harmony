const ParentUser = require('../models/ParentUser');
const Student = require('../models/Student');
const School = require('../models/School');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register parent
// @route   POST /api/parent/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phone, schoolCode, studentIds } = req.body;

  // Validate school code
  const school = await School.findOne({ code: schoolCode });
  if (!school) {
    return next(new ErrorResponse('Invalid school code', 400));
  }

  // Validate student IDs if provided
  let students = [];
  if (studentIds && studentIds.length > 0) {
    students = await Student.find({
      _id: { $in: studentIds },
      school: school._id
    });

    if (students.length !== studentIds.length) {
      return next(new ErrorResponse('One or more student IDs are invalid', 400));
    }
  }

  // Check if parent already exists
  const existingParent = await ParentUser.findOne({ email });
  if (existingParent) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  // Create parent
  const parent = await ParentUser.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    school: school._id,
    students: students.map(s => s._id)
  });

  // Generate verification token
  const verificationToken = parent.generateVerificationToken();
  await parent.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/parent/auth/verify-email/${verificationToken}`;

  const message = `You are receiving this email because you have registered for a parent account with Class Harmony. Please click the link below to verify your email address:\n\n${verificationUrl}`;

  try {
    await sendEmail({
      email: parent.email,
      subject: 'Email Verification',
      message
    });

    sendTokenResponse(parent, 201, res, {
      message: 'Parent registered successfully. Please check your email to verify your account.'
    });
  } catch (error) {
    parent.verificationToken = undefined;
    await parent.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Verify email
// @route   GET /api/parent/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const parent = await ParentUser.findOne({
    verificationToken
  });

  if (!parent) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set verified flag to true and remove verification token
  parent.isVerified = true;
  parent.verificationToken = undefined;
  await parent.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.'
  });
});

// @desc    Login parent
// @route   POST /api/parent/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for parent
  const parent = await ParentUser.findOne({ email }).select('+password');

  if (!parent) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await parent.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if email is verified
  if (!parent.isVerified) {
    return next(new ErrorResponse('Please verify your email address before logging in', 401));
  }

  // Update last login
  await parent.updateLastLogin();

  sendTokenResponse(parent, 200, res);
});

// @desc    Get current logged in parent
// @route   GET /api/parent/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const parent = await ParentUser.findById(req.user.id).populate('students', 'firstName lastName grade');

  res.status(200).json({
    success: true,
    data: parent
  });
});

// @desc    Update parent details
// @route   PUT /api/parent/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone
  };

  const parent = await ParentUser.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: parent
  });
});

// @desc    Update password
// @route   PUT /api/parent/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const parent = await ParentUser.findById(req.user.id).select('+password');

  // Check current password
  if (!(await parent.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  parent.password = req.body.newPassword;
  await parent.save();

  sendTokenResponse(parent, 200, res);
});

// @desc    Forgot password
// @route   POST /api/parent/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const parent = await ParentUser.findOne({ email: req.body.email });

  if (!parent) {
    return next(new ErrorResponse('There is no parent with that email', 404));
  }

  // Get reset token
  const resetToken = parent.getResetPasswordToken();

  await parent.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/parent/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: parent.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    parent.resetPasswordToken = undefined;
    parent.resetPasswordExpire = undefined;

    await parent.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/parent/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const parent = await ParentUser.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!parent) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  parent.password = req.body.password;
  parent.resetPasswordToken = undefined;
  parent.resetPasswordExpire = undefined;
  await parent.save();

  sendTokenResponse(parent, 200, res);
});

// @desc    Log parent out / clear cookie
// @route   GET /api/parent/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Helper method to get token from model, create cookie and send response
const sendTokenResponse = (parent, statusCode, res, additionalData = {}) => {
  // Create token
  const token = parent.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  const responseData = {
    success: true,
    token,
    ...additionalData
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json(responseData);
}; 